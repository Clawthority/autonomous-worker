// Rental Scam Simulation #1: "Too Good to Be True" Listing
// Difficulty: Beginner | Scam Type: Rental / Housing

module.exports = {
  id: 'rental-01',
  category: 'rental',
  difficulty: 'beginner',
  title: 'The Perfect Apartment',

  scenario: `You're apartment hunting and find this listing on a Facebook group:

🏠 **2BR/1BA Apartment — $850/mo (utilities included)**
📍 Downtown area, near transit
✨ Recently renovated, pet-friendly, in-unit laundry

*"Hi! I'm Sarah, the owner. I'm currently working abroad and looking for a responsible tenant to take care of my place. Rent is $850/month including all utilities. I just need first month's rent + $500 deposit via Zelle to hold it. I can mail you the keys once payment clears. Here are some photos!"*

[Photos show a clean, modern apartment]

What do you do?`,

  choices: [
    {
      id: 'a',
      text: 'Send the deposit — it\'s a great deal and she seems legit',
      correct: false,
      feedback: 'This is a classic remote landlord scam. Red flags you missed: price far below market, owner "working abroad," requesting payment via Zelle (no buyer protection), offering to mail keys sight-unseen. These photos were likely stolen from another listing.'
    },
    {
      id: 'b',
      text: 'Ask to see the apartment in person before sending any money',
      correct: true,
      feedback: 'Exactly right. Never pay for a rental you haven\'t toured in person. Legitimate landlords expect this. If she makes excuses about being abroad or says someone else is about to take it, that\'s pressure tactics — walk away.'
    },
    {
      id: 'c',
      text: 'Offer to pay half the deposit now and half when you get the keys',
      correct: false,
      feedback: 'Negotiating with a scammer still means losing money. Even a partial payment via Zelle is unrecoverable. The issue isn\'t the amount — it\'s sending money to a stranger for a property you\'ve never visited or verified they own.'
    }
  ],

  correctChoice: 'b',

  redFlags: [
    'Rent significantly below market rate for the area',
    'Landlord claims to be out of town / abroad',
    'Requests payment via irreversible methods (Zelle, wire, gift cards)',
    'Willing to "hold" the apartment without meeting you',
    'Offers to mail keys — no in-person showing',
    'Photos may be stolen from legitimate listings'
  ],

  tips: [
    'Always tour in person before paying anything',
    'Reverse image search the listing photos',
    'Verify the owner through county property records',
    'Never pay via Zelle, CashApp, or wire transfer for rentals',
    'If the deal seems too good, it almost certainly is'
  ]
};
