#!/usr/bin/env node
/**
 * Autonomous Worker — State Machine
 * 
 * Three scripts:
 *   worker.js   — Runs every 1-5 min. Does micro-steps.
 *   reporter.js — Runs every 60 min. Sends progress reports.
 *   listener.js — Triggered by message. Sets interrupt.
 * 
 * All share state.json. All use file locking to prevent race conditions.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const STATE_FILE = path.join(BASE_DIR, 'state.json');
const LOCK_FILE = path.join(BASE_DIR, 'llm_in_use.lock');
const LOCK_TIMEOUT_MS = 60000; // 60 seconds max lock duration

// ========================================================================
// FILE LOCKING — Prevents race conditions when multiple scripts run
// ========================================================================

function acquireLock(maxWaitMs = 30000) {
  const start = Date.now();
  
  while (Date.now() - start < maxWaitMs) {
    try {
      // Check if lock exists and is stale
      if (fs.existsSync(LOCK_FILE)) {
        const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
        const lockAge = Date.now() - lockData.acquired_at;
        
        if (lockAge > LOCK_TIMEOUT_MS) {
          // Stale lock — remove it
          console.error('Removing stale lock (age: ' + lockAge + 'ms)');
          fs.unlinkSync(LOCK_FILE);
        } else {
          // Lock is fresh — wait
          continue;
        }
      }
      
      // Try to create lock (atomic write)
      const lock = {
        pid: process.pid,
        acquired_at: Date.now(),
        script: path.basename(process.argv[1] || 'unknown')
      };
      
      fs.writeFileSync(LOCK_FILE, JSON.stringify(lock), { flag: 'wx' });
      return true;
      
    } catch(e) {
      if (e.code === 'EEXIST') {
        // Lock already exists — wait and retry
        continue;
      }
      throw e;
    }
  }
  
  console.error('Could not acquire lock after ' + maxWaitMs + 'ms');
  return false;
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
    }
  } catch(e) {
    console.error('Error releasing lock:', e.message);
  }
}

// ========================================================================
// STATE MANAGEMENT
// ========================================================================

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch(e) {
    console.error('Error loading state:', e.message);
    return null;
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ========================================================================
// SCRIPT A: THE WORKER (runs every 1-5 minutes via cron)
// ========================================================================

function runWorker() {
  console.log('[Worker] Starting...');
  
  const state = loadState();
  if (!state) {
    console.error('[Worker] No state file found');
    return;
  }
  
  state.last_worker_run = new Date().toISOString();
  
  // Check if we need to handle an interrupt
  if (state.status === 'interrupted' && state.interrupt_prompt) {
    console.log('[Worker] Handling interrupt:', state.interrupt_prompt.slice(0, 100));
    
    // The interrupt will be handled by the LLM
    // For now, we save the prompt and mark as working
    const interrupt = state.interrupt_prompt;
    state.interrupt_prompt = null;
    state.status = 'working';
    
    // Save interrupt for the LLM to process
    state.task_progress.push({
      type: 'interrupt',
      message: interrupt,
      timestamp: new Date().toISOString(),
      status: 'pending_llm_response'
    });
    
    saveState(state);
    console.log('[Worker] Interrupt queued for LLM processing');
    return;
  }
  
  // Normal working mode
  if (state.status === 'working') {
    if (!state.current_task) {
      // Pop next task from queue
      if (state.queue.length > 0) {
        state.current_task = state.queue.shift();
        state.current_task.started_at = new Date().toISOString();
        state.task_progress = [];
        console.log('[Worker] Starting new task:', state.current_task.title);
      } else {
        console.log('[Worker] Queue empty. Creating new tasks...');
        state.queue = generateTasks();
        saveState(state);
        return;
      }
    }
    
    // Log this work cycle
    state.task_progress.push({
      type: 'work_cycle',
      task_id: state.current_task.id,
      timestamp: new Date().toISOString(),
      note: 'Worker cycle executed'
    });
    
    saveState(state);
    console.log('[Worker] Working on:', state.current_task.title);
  }
  
  // If paused, do nothing
  if (state.status === 'paused') {
    console.log('[Worker] Paused. Skipping.');
    return;
  }
}

// Generate new tasks when queue is empty
function generateTasks() {
  return [
    { id: 'auto-' + Date.now() + '-1', title: 'Review and improve all product READMEs', product: 'all', priority: 'medium' },
    { id: 'auto-' + Date.now() + '-2', title: 'Check GitHub repos for issues or PRs', product: 'all', priority: 'medium' },
    { id: 'auto-' + Date.now() + '-3', title: 'Update STRATEGY.md with new integration opportunities', product: 'all', priority: 'low' },
    { id: 'auto-' + Date.now() + '-4', title: 'Test all products end-to-end', product: 'all', priority: 'medium' },
    { id: 'auto-' + Date.now() + '-5', title: 'Write blog post about what we built', product: 'all', priority: 'low' }
  ];
}

// ========================================================================
// SCRIPT B: THE REPORTER (runs every 60 minutes via cron)
// ========================================================================

function runReporter() {
  console.log('[Reporter] Starting...');
  
  const state = loadState();
  if (!state) {
    console.error('[Reporter] No state file found');
    return;
  }
  
  state.last_reporter_run = new Date().toISOString();
  
  // Collect what was completed this hour
  const completed = state.completed_this_hour || [];
  const currentTask = state.current_task;
  
  // Build report
  const report = {
    completed: completed,
    current_task: currentTask ? currentTask.title : 'No task in progress',
    queue_length: state.queue ? state.queue.length : 0,
    total_completed: state.completed ? state.completed.length : 0,
    status: state.status
  };
  
  // Clear completed_this_hour
  state.completed_this_hour = [];
  
  saveState(state);
  
  console.log('[Reporter] Report generated:', JSON.stringify(report));
  return report;
}

// ========================================================================
// SCRIPT C: THE LISTENER (triggered by message)
// ========================================================================

function runListener(userMessage) {
  console.log('[Listener] Interrupt received:', userMessage.slice(0, 100));
  
  const state = loadState();
  if (!state) {
    console.error('[Listener] No state file found');
    return;
  }
  
  // Pause current task
  if (state.current_task && state.status === 'working') {
    state.status = 'interrupted';
    state.paused_task = { ...state.current_task };
    state.interrupt_prompt = userMessage;
    console.log('[Listener] Task paused:', state.current_task.title);
  } else {
    state.interrupt_prompt = userMessage;
    state.status = 'interrupted';
  }
  
  saveState(state);
  console.log('[Listener] State saved. Worker will handle on next cycle.');
}

// ========================================================================
// CLI INTERFACE
// ========================================================================

const command = process.argv[2];

switch(command) {
  case 'worker':
    runWorker();
    break;
    
  case 'reporter':
    const report = runReporter();
    if (report) console.log(JSON.stringify(report, null, 2));
    break;
    
  case 'listener':
    const message = process.argv[3] || 'No message provided';
    runListener(message);
    break;
    
  case 'status':
    const state = loadState();
    if (state) {
      console.log(JSON.stringify({
        status: state.status,
        current_task: state.current_task?.title || 'None',
        queue_length: state.queue?.length || 0,
        completed: state.completed?.length || 0,
        completed_this_hour: state.completed_this_hour?.length || 0,
        has_interrupt: !!state.interrupt_prompt
      }, null, 2));
    }
    break;
    
  case 'complete':
    // Mark current task as completed
    const s = loadState();
    if (s && s.current_task) {
      s.completed.push({ ...s.current_task, completed_at: new Date().toISOString() });
      s.completed_this_hour.push(s.current_task.title);
      s.current_task = s.queue?.length > 0 ? s.queue.shift() : null;
      s.task_progress = [];
      if (s.current_task) s.current_task.started_at = new Date().toISOString();
      s.status = 'working';
      saveState(s);
      console.log('Task completed. Next:', s.current_task?.title || 'Queue empty');
    }
    break;
    
  case 'add-task':
    const taskTitle = process.argv[3] || 'New task';
    const taskPriority = process.argv[4] || 'medium';
    const taskProduct = process.argv[5] || 'all';
    const stateFile = loadState();
    if (stateFile) {
      stateFile.queue.push({
        id: 'manual-' + Date.now(),
        title: taskTitle,
        product: taskProduct,
        priority: taskPriority
      });
      saveState(stateFile);
      console.log('Task added:', taskTitle);
    }
    break;
    
  case 'lock-test':
    console.log('Testing lock...');
    if (acquireLock()) {
      console.log('Lock acquired!');
      setTimeout(() => {
        releaseLock();
        console.log('Lock released!');
      }, 3000);
    }
    break;
    
  default:
    console.log('Usage:');
    console.log('  node state-machine.js worker          — Run worker cycle');
    console.log('  node state-machine.js reporter         — Run reporter cycle');
    console.log('  node state-machine.js listener "msg"   — Handle interrupt');
    console.log('  node state-machine.js status           — Show current state');
    console.log('  node state-machine.js complete         — Mark task complete');
    console.log('  node state-machine.js add-task "title" [priority] [product]');
    console.log('  node state-machine.js lock-test        — Test file locking');
}

module.exports = { acquireLock, releaseLock, loadState, saveState, runWorker, runReporter, runListener };
