// Each listingDescription contains a deliberate "tell" about seller motivation.
// hiddenIssues surface only if the buyer waives their inspection contingency.

const houses = [
  {
    id: 'h1',
    address: '412 Maplebrook Court, Cedarville, OH 45314',
    askingPrice: 348000,
    beds: 4,
    baths: 2.5,
    sqft: 2140,
    yearBuilt: 1997,
    daysOnMarket: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'Move-in-ready colonial with gleaming hardwoods and an updated eat-in kitchen. ' +
      'The owners have already relocated for a new position. The home is vacant: ' +
      'immediate occupancy available. All furnishings negotiable; sellers are motivated ' +
      'and prefer a quick, uncomplicated close.',
    hiddenIssues: [
      { issue: 'HVAC system is 17 years old and showing signs of failure', repairCost: 8500 },
      { issue: 'Hairline foundation crack in northwest corner of basement', repairCost: 3200 },
    ],
  },
  {
    id: 'h2',
    address: '2847 Willowshire Drive, Lakewood, CO 80226',
    askingPrice: 519000,
    beds: 3,
    baths: 2,
    sqft: 1780,
    yearBuilt: 1962,
    daysOnMarket: 14,
    imageUrl:
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'Lovingly maintained craftsman bungalow owned by the same family for 31 years. ' +
      'The backyard vegetable garden (established over two decades) conveys with the home. ' +
      'The sellers are not in a financial rush; they are looking for buyers who will ' +
      'appreciate what has been built here and care for it accordingly.',
    hiddenIssues: [
      {
        issue: 'Federal Pacific Stab-Lok electrical panel (known fire hazard, requires full replacement)',
        repairCost: 4800,
      },
      { issue: 'Original cast-iron drain lines corroding; partial replacement needed', repairCost: 6500 },
    ],
  },
  {
    id: 'h3',
    address: '94 Thornberry Lane, Millford, PA 18337',
    askingPrice: 272000,
    beds: 3,
    baths: 1,
    sqft: 1340,
    yearBuilt: 1968,
    daysOnMarket: 21,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'Offered on behalf of the estate of Dorothy M. Callahan, this classic ranch has been ' +
      'in the family since it was built. Sold strictly as-is; no seller disclosures are ' +
      'available and no repairs or credits will be provided. The executor requests a clean, ' +
      'uncomplicated offer. Cash or conventional financing strongly preferred.',
    hiddenIssues: [
      { issue: 'Asbestos floor tiles in basement (requires licensed abatement)', repairCost: 7200 },
      { issue: 'Active mold growth behind master bath tile wall', repairCost: 9500 },
      { issue: 'Roof at end of serviceable life. Full replacement required.', repairCost: 14000 },
    ],
  },
  {
    id: 'h4',
    address: '1103 Sunridge Terrace, Westfield, IL 60153',
    askingPrice: 785000,
    beds: 5,
    baths: 3.5,
    sqft: 3620,
    yearBuilt: 2003,
    daysOnMarket: 47,
    imageUrl:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'A comprehensive top-to-bottom renovation spared no expense: custom inset cabinetry, ' +
      'radiant heated floors, Wolf appliances, and a primary suite with a spa-style bath. ' +
      'Priced to reflect $190,000 in documented upgrades completed over four years. ' +
      'The seller is under no time pressure and will wait for a buyer who recognizes the value.',
    hiddenIssues: [
      {
        issue: 'Rear deck addition built without permit. Buyer assumes liability to permit or remove.',
        repairCost: 2500,
      },
    ],
  },
  {
    id: 'h5',
    address: '7 Copper Creek Way, Pinedale, AZ 85257',
    askingPrice: 431000,
    beds: 4,
    baths: 2,
    sqft: 1960,
    yearBuilt: 1988,
    daysOnMarket: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'Fully renovated in 2024: new roof, new HVAC, new plumbing fixtures, and a ' +
      'kitchen that looks straight out of a design magazine. The selling entity is an LLC ' +
      'seeking a straightforward transaction: competitive price, minimal contingencies, ' +
      'and a buyer with the financing to close with confidence. Serious inquiries only.',
    hiddenIssues: [
      {
        issue: 'Cosmetic renovation concealed corroded galvanized supply lines; full repipe required',
        repairCost: 12000,
      },
      {
        issue: 'Electrical subpanel work performed without permits; city inspection required',
        repairCost: 5500,
      },
    ],
  },
  {
    id: 'h6',
    address: '3318 Ridgemont Avenue, Hollister, CA 95023',
    askingPrice: 389000,
    beds: 3,
    baths: 2,
    sqft: 1550,
    yearBuilt: 1979,
    daysOnMarket: 62,
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    listingDescription:
      'Priced below neighborhood comps, this three-bedroom bungalow is offered as a ' +
      'short sale, subject to lender approval. Sold as-is; no repairs, credits, or ' +
      'seller disclosures will be provided. Buyers should expect an extended escrow ' +
      'of 60–90 days pending bank review. A strong, clean offer is the only kind ' +
      'the lender will consider.',
    hiddenIssues: [
      { issue: 'Extensive water intrusion and rot in crawl space subfloor', repairCost: 18000 },
      { issue: 'HVAC system non-functional. Full replacement required.', repairCost: 7500 },
      { issue: 'Deferred maintenance across roof, gutters, and exterior siding', repairCost: 11000 },
    ],
  },
]

export default houses
