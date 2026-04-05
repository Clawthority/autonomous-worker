// Job Scam Simulation #1: "Guaranteed Income" Opportunity
// Difficulty: Beginner | Scam Type: Employment / Work-from-Home

module.exports = {
  id: 'job-scam-01',
  category: 'job',
  difficulty: 'beginner',
  title: 'The Dream Remote Job',

  scenario: `You receive a direct message on LinkedIn:

"Hi! We came across your profile and think you'd be perfect for our new 'Personal Shopping Assistant' role. It's fully remote, $45/hour, and you can work whenever you want!

The role involves helping wealthy clients shop online. We send you a check to cover the purchases — you keep $300 as your first week's pay and wire the rest to our "supplier."

To get started, we just need you to pay a $50 "training deposit" via Venmo to secure your spot. This is refundable after your first shift!

Interested? Just reply with your name, email, and Venmo handle."

What do you do?`,

  choices: [
    {
      id: 'a',
      text: 'Accept — $45/hour remote work is hard to find',
      correct: false,
      feedback: 'This is a fake check scam. Red flags: (1) They reached out to you, not the other way around. (2) "Guaranteed income" with no interview. (3) You pay THEM to get a job — real employers never do this. (4) The "check" will bounce after you\'ve wired money to the "supplier," leaving you liable.'
    },
    {
      id: 'b',
      text: 'Ask for more details: job description, company name, interview process',
      correct: true,
      feedback: 'Exactly right. A legitimate employer will have a real job posting, company website, and proper interview process. The vague responses and pressure to pay a "deposit" are classic scam indicators. Real jobs don\'t require you to pay to work.'
    },
    {
      id: 'c',
      text: 'Request a video call to verify they\'re real before paying anything',
      correct: false,
      feedback: 'Good instinct to verify, but scammers can do quick video calls or use stock photos. The core problem is paying to get a job — no legitimate company does this. Even a video call won\'t change that they\'re asking you to Venmo money before working.'
    }
  ],

  correctChoice: 'b',

  redFlags: [
    'Employer reached out to you without applying',
    'No formal interview or application process',
    'You must pay a "deposit" or "training fee" to start',
    'They send you a check to wire money elsewhere',
    'Vague job duties ("personal shopping assistant")',
    'Guaranteed income with no experience required',
    'Payment via Venmo, CashApp, or gift cards'
  ],

  tips: [
    'Real employers never ask you to pay to work',
    'Legitimate jobs require applications and interviews',
    'Never deposit a check and wire money — it\'s a scam',
    'Verify the company through reviews and their actual website',
    'If it sounds too good to be true, it is'
  ]
};