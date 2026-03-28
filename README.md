# 🏭 Autonomous Worker — State Machine Architecture

A continuous, 24/7 autonomous work system with proper state management and interrupt handling.

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Worker    │    │   Reporter   │    │   Listener  │
│  (5 min)    │    │  (60 min)    │    │ (on message)│
└──────┬──────┘    └──────┬───────┘    └──────┬──────┘
       │                  │                    │
       └──────────┬───────┴────────────────────┘
                  │
           ┌──────▼──────┐
           │  state.json │ ← Source of truth
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ llm_in_use  │ ← File lock
           │   .lock     │
           └─────────────┘
```

## Components

### state.json — Source of Truth
- `status`: working | paused | interrupted
- `current_task`: What's being worked on
- `task_progress`: Micro-steps completed
- `queue`: Upcoming tasks
- `completed_this_hour`: Tasks finished since last report
- `interrupt_prompt`: High-priority message from user

### Worker (every 5 min)
1. Read state.json
2. If interrupted → handle interrupt
3. If working → do one micro-step
4. Update state.json

### Reporter (every 60 min)
1. Read state.json
2. Collect completed_this_hour
3. Format 1-2 line report
4. Send to user
5. Clear completed_this_hour

### Listener (on message)
1. Read state.json
2. Set status = "interrupted"
3. Save user message as interrupt_prompt
4. Worker handles it next cycle

## File Locking

Prevents race conditions when multiple scripts access state.json:
- Check if `llm_in_use.lock` exists
- If stale (>60s old) → remove it
- If fresh → wait and retry
- If absent → create lock (atomic write)
- On complete → delete lock

## Usage

```bash
node state-machine.js status      # Show current state
node state-machine.js worker      # Run one work cycle
node state-machine.js reporter    # Generate progress report
node state-machine.js listener "msg"  # Handle interrupt
node state-machine.js complete    # Mark task complete
node state-machine.js add-task "title" [priority] [product]
```

## License

MIT
