// Rental Scam Simulation #2: Fake Property Manager
// Difficulty: Beginner | Scam Type: Rental / Housing

module.exports = {
  id: 'rental-02',
  category: 'rental',
  difficulty: 'beginner',
  title: 'The Property Manager',

  scenario: `You respond to a Craigslist listing for a 1BR apartment at $950/mo. The person replies:

*"Hi! Thanks for your interest. I'm Mike, the property manager for this unit. The owner hired our company to handle leasing. The apartment is available now and we have several people interested. 

To move forward, I just need you to fill out our application ($50 fee) and submit a $200 holding deposit. You can Venmo both to @PremierRentalsLLC. Once approved, we'll schedule a showing and sign the lease.

Here's our website: premier-rentals-llc.net"*

You check the website — it looks semi-professional but was created 2 weeks ago.`,

  choices: [
    {
      id: 'a',
      text: 'Pay the $250 — the website looks real enough and you don\'t want to lose the apartment',
      correct: false,
      feedback: 'A 2-week-old website for a "property management company" is a huge red flag. Legitimate PM firms have years of online history, reviews, and verifiable business registrations. The application fee + holding deposit combo is designed to extract money before you ever see the unit.'
    },
    {
      id: 'b',
      text: 'Ask for the company\'s business license number and the property owner\'s name to verify',
      correct: true,
      feedback: 'Smart move. Legitimate property managers can provide their business license, the property owner\'s name, and verifiable references. If Mike stalls, makes excuses, or gets aggressive — he\'s not real. You can also check your state\'s business registry online for free.'
    },
    {
      id: 'c',
      text: 'Ask to see the apartment first, then pay the fees if you like it',
      correct: false,
      feedback: 'Better instinct than paying blind, but you\'re still engaging with a scammer. A fake PM won\'t have access to the actual unit. They\'ll make excuses ("the tenant is still there," "we do virtual tours only") to keep the scam going. Verify the company exists first.'
    }
  ],

  correctChoice: 'b',

  redFlags: [
    'Recently created website with no history or reviews',
    'Requesting fees before any in-person interaction',
    'Creating urgency ("several people interested")',
    'Payment via personal Venmo/CashApp instead of business accounts',
    'No verifiable business license or physical office',
    'Generic company name that\'s hard to search/verify'
  ],

  tips: [
    'Look up the company on your state\'s Secretary of State business registry',
    'Check website age with WHOIS lookup (free tools available)',
    'Google the company name + "scam" to see if others have reported it',
    'Never pay application fees before seeing the unit in person',
    'Ask for the property owner\'s name and verify through county records'
  ]
};
