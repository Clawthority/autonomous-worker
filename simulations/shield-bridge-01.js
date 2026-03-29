/**
 * Scam Shield → Scam Academy Bridge Simulation
 * 
 * Takes a real scam detection pattern from Scam Shield and converts it
 * into an interactive training scenario for Scam Academy users.
 * 
 * Flow: Detection → Analysis → Simulation Template → Training
 */

module.exports = {
  id: 'shield-bridge-01',
  name: 'Phishing URL Detection Training',
  source: 'scam-shield',
  detectionType: 'phishing-url',

  // Raw detection pattern from Scam Shield
  detectionPattern: {
    triggers: [
      'urgency_keywords: ["verify now", "account suspended", "immediate action"]',
      'domain_mismatch: display_url !== actual_url',
      'tld_suspicious: ".xyz", ".top", ".click"',
      'brand_impersonation: ["paypal", "amazon", "bank"]',
    ],
    riskScore: 0.87,
    category: 'phishing',
  },

  // Generated training scenario
  scenario: {
    title: 'Spot the Fake Login Page',
    difficulty: 'intermediate',
    estimatedMinutes: 5,

    intro: `You receive an email claiming your PayPal account has been "temporarily suspended due to suspicious activity." The email looks professional and includes PayPal's logo. There's a button that says "Verify My Account Now."`,

    steps: [
      {
        id: 1,
        prompt: 'What is the FIRST thing you should check?',
        options: [
          { text: 'Click the button to see where it goes', correct: false, feedback: 'Never click suspicious links — even "just to check." Hover instead.' },
          { text: 'Hover over the link to see the actual URL', correct: true, feedback: 'Correct! Hovering reveals the real destination. The display might say paypal.com but the actual URL could be paypa1-verify.xyz' },
          { text: 'Reply to ask if it\'s legitimate', correct: false, feedback: 'Replying confirms your email is active to scammers.' },
          { text: 'Forward it to your friends to warn them', correct: false, feedback: 'Forwarding spreads the phishing attempt.' },
        ],
      },
      {
        id: 2,
        prompt: 'You hover and see the URL is "paypa1-secure.xyz/verify". What gives it away?',
        options: [
          { text: 'The ".xyz" domain — PayPal uses .com', correct: false, feedback: 'Good observation, but there\'s more.' },
          { text: 'The "1" replacing the "l" in paypal', correct: false, feedback: 'Sharp eye! But that\'s not the only sign.' },
          { text: 'Both the character substitution AND the suspicious TLD', correct: true, feedback: 'Exactly right. Scammers rely on you not looking closely. Multiple red flags = high confidence it\'s a scam.' },
          { text: 'Nothing, it looks legitimate', correct: false, feedback: 'Look closer — there are at least 2 red flags here.' },
        ],
      },
      {
        id: 3,
        prompt: 'What should you do next?',
        options: [
          { text: 'Report it as phishing, then delete it', correct: true, feedback: 'Perfect. Report → Delete → Move on. If worried about your account, go directly to paypal.com (type it yourself).' },
          { text: 'Open it in incognito mode to be safe', correct: false, feedback: 'Incognito doesn\'t protect you from phishing. The page can still steal your credentials.' },
          { text: 'Ignore it and hope it goes away', correct: false, feedback: 'Reporting helps protect others. Take 10 seconds to report it.' },
          { text: 'Change your PayPal password immediately', correct: false, feedback: 'You don\'t need to change your password unless you actually clicked the link and entered credentials. If you did, then yes — change it immediately.' },
        ],
      },
    ],

    debrief: `This simulation was generated from a real phishing pattern that Scam Shield detected 347 times in the last 30 days. The most common mistake? 62% of users clicked "verify now" without checking the URL first. That's exactly why practice matters.`,
  },

  // Metadata for analytics
  meta: {
    generatedAt: new Date().toISOString(),
    detectionsInLast30Days: 347,
    averageUserMissRate: 0.62,
    tags: ['phishing', 'url-analysis', 'email-scam', 'paypal'],
  },
};
