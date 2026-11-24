/* Startup Grand Line — chart data.
   Seven routes (startup sectors), five islands each (funding stages),
   one starting point (Reverse Mountain) and one destination (The Exit). */
window.GL = {
  stages: [
    { key: 'pre-seed', name: 'Pre-Seed', about: 'A team, a problem and a first cheque from angels, a foundry or a grant.' },
    { key: 'seed', name: 'Seed', about: 'A first product in the hands of first users, funded by seed funds.' },
    { key: 'series-a', name: 'Series A', about: 'Product-market fit: proof that customers come back and pay.' },
    { key: 'growth', name: 'Growth (Series B–C)', about: 'Past the Red Line: scaling sales and teams in global markets.' },
    { key: 'late', name: 'Late Stage', about: 'A mature company choosing between an IPO, a buyer, or staying independent.' }
  ],

  start: {
    name: 'Reverse Mountain',
    tagline: 'Every voyage begins by sailing uphill.',
    desc: 'This is the moment of decision: finishing army service, leaving a comfortable job at a multinational R&D centre, or walking out of a university lab with an idea. Seven currents run down the mountain, one for each sea of the Israeli startup world. Pick one — you can still drift between them later.',
    points: [
      'Israel spends a larger share of its GDP on R&D than almost any other country.',
      'The Yozma programme (1993) used public money to seed the local venture-capital industry.',
      'The Israel Innovation Authority still co-funds early, risky R&D with grants.',
      'Hundreds of multinationals run R&D centres here — a steady supply of future founders.'
    ]
  },

  redline: {
    name: 'The Red Line',
    tagline: 'The home market ends here.',
    desc: 'Israel is a small market, so somewhere between Series A and growth nearly every startup has to cross this wall: open a US or European base, hire a go-to-market team abroad, and often relocate a founder. R&D usually stays in Israel. There are only seven gates through the Red Line — one per route — and many ships never make it past.',
    points: [
      'A classic pattern: headquarters and sales in New York or the Bay Area, engineering in Tel Aviv.',
      'Many founders set up a US parent company early to make this crossing easier.',
      'Beyond it lies the New World: bigger rounds, international funds, and global competitors.'
    ]
  },

  exit: {
    name: 'The Exit',
    tagline: 'The treasure at the end of the line.',
    desc: 'All seven routes end on the same island. Some crews arrive by acquisition, some by ringing a stock-exchange bell, and some by selling a stake to a private-equity fund. Whichever way they land, the treasure tends to go back to sea: founders and early employees become angels, mentors and second-time captains — and the voyage starts again at Reverse Mountain.',
    points: [
      'Acquisition (M&A) — by number of deals, the most common way Israeli startups exit.',
      'IPO — most often on Nasdaq or the NYSE, sometimes dual-listed in Tel Aviv.',
      'Secondary or buyout — founders and employees sell shares while the company sails on.',
      'The loop — exit money and experience seed the next generation of startups.'
    ],
    legends: ['Wiz → Google ($32B deal, announced 2025)', 'CyberArk → Palo Alto Networks (~$25B deal, announced 2025)', 'Mobileye → Intel ($15.3B, 2017)', 'Mellanox → Nvidia (~$7B, 2020)']
  },

  lanes: [
    {
      id: 'cyber', name: 'Cipher Strait', sector: 'Cybersecurity', color: '#ff6b6b',
      blurb: 'Israel’s signature route, crewed by veterans of military intelligence and technology units.',
      islands: [
        { name: 'Unit Cove', tagline: 'Where veterans turn attack experience into a pitch.',
          desc: 'Many Israeli cyber founders meet during service in units such as 8200, and leave with a team, a way of thinking about attackers and a network of peers. The first months are spent interviewing security chiefs, not writing code.',
          points: ['Two or three co-founders who already served together', 'Dozens of conversations with CISOs to find a real pain', 'Foundries and cyber-only seed funds scout these waters'],
          legends: ['8200 alumni network', 'Team8', 'Cyberstarts', 'YL Ventures'] },
        { name: 'Stealth Atoll', tagline: 'Build quietly, with customers in the room.',
          desc: 'Cyber seeds are often large and the company often stays in stealth. A handful of design partners — usually American enterprises — shape a narrow first product that solves one sharp problem.',
          points: ['Design partners instead of a public launch', 'A narrow wedge product, deployed in days', 'Seed rounds among the biggest of any sector'],
          legends: ['Adallom', 'Dig Security', 'Talon'] },
        { name: 'Design-Partner Reef', tagline: 'From friendly pilots to signed contracts.',
          desc: 'Series A is about converting design partners into paying enterprise customers and proving the founders can sell. A founder typically starts spending most of their time in the US.',
          points: ['First six-figure enterprise deals', 'Founder-led sales, then a first sales leader', 'A new category name that analysts start to repeat'],
          legends: ['Cato Networks', 'Island', 'Armis'] },
        { name: 'Platform Fortress', tagline: 'One product becomes a platform.',
          desc: 'Growth-stage cyber companies race to expand from a single product into a platform, sell through cloud marketplaces and channel partners, and sometimes start buying smaller startups themselves.',
          points: ['Multi-product platform and cross-sell', 'Channel partners and cloud marketplaces', 'Acquiring younger startups for talent and features'],
          legends: ['Wiz', 'SentinelOne', 'Snyk'] },
        { name: 'Consolidation Citadel', tagline: 'Giants are shopping. So is Wall Street.',
          desc: 'Security buyers want fewer vendors, so the largest platforms acquire aggressively. A late-stage cyber company chooses between becoming an acquirer, going public, or accepting an offer it cannot refuse.',
          points: ['Strategic buyers pay for category leaders', 'IPO readiness: predictable recurring revenue', 'Exit money flows straight back into new cyber seeds'],
          landings: ['Check Point — Nasdaq IPO, 1996', 'CyberArk — Nasdaq IPO, 2014', 'SentinelOne — NYSE IPO, 2021', 'Wiz — Google deal, 2025'] }
      ]
    },
    {
      id: 'fintech', name: 'Coin Current', sector: 'Fintech & Insurtech', color: '#ffd166',
      blurb: 'Payments, lending, insurance and risk — built for markets far larger than home.',
      islands: [
        { name: 'Small-Market Shoals', tagline: 'Too small to stay home.',
          desc: 'The local financial market is tiny, so fintech founders design for the US and Europe from the first day. The crew usually mixes data scientists with someone who understands regulation.',
          points: ['Choose a wedge: payments, lending, insurance or fraud', 'Map the regulation before the product', 'Communities such as Fintech-Aviv connect early crews'],
          legends: ['Fintech-Aviv', 'Bank innovation labs'] },
        { name: 'Sandbox Sandbar', tagline: 'A first product, and a partner with a licence.',
          desc: 'A seed-stage fintech rarely holds its own licences. It launches an MVP on top of a partner bank or insurer and hires compliance help far earlier than other startups would.',
          points: ['Partner bank or carrier behind the product', 'Early compliance and risk hires', 'First real money moves through the system'],
          legends: ['Melio', 'Fundbox', 'Next Insurance'] },
        { name: 'License Lighthouse', tagline: 'Trusted with other people’s money.',
          desc: 'By Series A the company holds or is winning its own licences in its first markets and can show that each customer is worth more than they cost. Risk models built on data science become the moat.',
          points: ['Own licences in the first markets', 'Unit economics that survive scrutiny', 'Machine-learning risk and underwriting models'],
          legends: ['Lemonade', 'Rapyd', 'Pagaya'] },
        { name: 'Cross-Border Bazaar', tagline: 'Many countries, many currencies, many products.',
          desc: 'Growth means adding countries and products at the same time: more payment corridors, more licences, more partners — while keeping fraud and losses under control as volume multiplies.',
          points: ['Multi-country licences and banking partners', 'Second and third products for the same customer', 'Fraud prevention at scale'],
          legends: ['Payoneer', 'Tipalti', 'Riskified'] },
        { name: 'Bell-Ringer Bay', tagline: 'Audited, regulated and ready to list.',
          desc: 'Late-stage fintechs already live under heavy regulation, which makes the step to public markets natural. Others are bought by global financial groups that want their technology and customers.',
          points: ['Public-company grade finance and reporting', 'A clear path to profitability', 'Global insurers and software groups as buyers'],
          landings: ['Lemonade — NYSE IPO, 2020', 'Payoneer — Nasdaq listing, 2021', 'eToro — Nasdaq IPO, 2025', 'Melio — acquired by Xero, 2025', 'Next Insurance — acquired by ERGO, 2025'] }
      ]
    },
    {
      id: 'consumer', name: 'Play Stream', sector: 'Consumer, Gaming & Adtech', color: '#5eead4',
      blurb: 'Apps, games, creator tools and the advertising engines that make them grow.',
      islands: [
        { name: 'Side-Project Sands', tagline: 'It starts as something fun.',
          desc: 'Consumer startups often begin as a side project by designers, game developers and growth marketers. With no big local audience, the first users are found abroad through app stores and ads.',
          points: ['A prototype people actually enjoy using', 'Founders who understand growth marketing', 'English first, global from day one'],
          legends: ['GameIS community', 'Indie studios'] },
        { name: 'Soft-Launch Shallows', tagline: 'Test quietly in small markets.',
          desc: 'The seed product is soft-launched in a few test countries. The crew watches one thing above all: how many users come back after a day, a week and a month.',
          points: ['Soft launch in test markets', 'Retention curves decide everything', 'Dozens of quick experiments a week'],
          legends: ['Lightricks', 'Moon Active'] },
        { name: 'Retention Ridge', tagline: 'Each user earns more than they cost.',
          desc: 'Series A investors want a working growth machine: paid acquisition that returns more than it spends, and a product people keep and pay for.',
          points: ['Lifetime value above acquisition cost', 'A scalable user-acquisition engine', 'First real monetisation: subscriptions, purchases or ads'],
          legends: ['Fiverr', 'Lightricks', 'Moon Active'] },
        { name: 'Live-Ops Lagoon', tagline: 'The product becomes a daily service.',
          desc: 'At scale, a game or app is run as a live operation with constant events and content. Israel is also a hub for the advertising technology that powers this whole sea.',
          points: ['Live operations and data teams', 'Monetisation and ad-mediation technology', 'Buying smaller studios to grow the portfolio'],
          legends: ['Playtika', 'Moon Active (Coin Master)', 'ironSource', 'Taboola'] },
        { name: 'Blockbuster Bay', tagline: 'Hits attract buyers.',
          desc: 'A proven hit with steady cash flow draws global gaming groups and public investors alike. Some crews sell, some list, and some merge to become platforms.',
          points: ['Strong cash flow from a portfolio of titles', 'Global entertainment groups as buyers', 'Mergers that turn tools into platforms'],
          landings: ['Playtika — acquired 2011, Nasdaq IPO 2021', 'Plarium — acquired by Aristocrat, 2017', 'Fiverr — NYSE IPO, 2019', 'Taboola — Nasdaq listing, 2021', 'ironSource — merged with Unity, 2022'] }
      ]
    },
    {
      id: 'ai', name: 'Cloud Channel', sector: 'AI & Enterprise Software', color: '#c4a7ff',
      blurb: 'Software for the world’s companies — and the AI now being built into all of it.',
      islands: [
        { name: 'Hackathon Haven', tagline: 'Two engineers and a laptop.',
          desc: 'The lightest ship on the sea: a couple of strong engineers, often army-trained, with a product idea drawn from their own daily work. It takes very little money to leave port.',
          points: ['A problem the founders had themselves', 'Angels, micro-funds and early grants', 'A working demo within weeks'],
          legends: ['Angel investors', 'University AI labs'] },
        { name: 'MVP Marina', tagline: 'Ship it and see who signs up.',
          desc: 'The seed product goes online early. Users abroad find it, try it for free and tell the team what is missing. Some of Israel’s biggest software companies began as tools built for internal use.',
          points: ['Self-serve product, free to try', 'First users found online, mostly abroad', 'Fast releases guided by usage data'],
          legends: ['Wix', 'monday.com (began as an internal tool at Wix)', 'AI21 Labs'] },
        { name: 'Fit Fjord', tagline: 'Customers pull the product out of your hands.',
          desc: 'Product-market fit shows up as repeatable revenue: customers renew, expand and refer others. The company now needs a real sales and customer-success motion.',
          points: ['Recurring revenue that renews and expands', 'A repeatable way to win customers', 'For AI startups: real usage, not just demos'],
          legends: ['Gong', 'Run:ai', 'AI21 Labs'] },
        { name: 'ARR Archipelago', tagline: 'Scale the machine.',
          desc: 'Large international growth funds arrive. Offices open in New York and London, the product spreads across whole organisations, and annual recurring revenue becomes the number everyone watches.',
          points: ['Sales teams in the US and Europe', 'International growth investors', 'Enterprise features: security, admin, integrations'],
          legends: ['AppsFlyer', 'JFrog', 'Similarweb'] },
        { name: 'Nasdaq Narrows', tagline: 'Predictable revenue loves public markets.',
          desc: 'Subscription software with steady growth is a natural fit for a listing, and big technology companies regularly buy Israeli teams for their AI and infrastructure skills.',
          points: ['Predictable growth and margins', 'Listing in New York', 'Tech giants buying AI and infrastructure teams'],
          landings: ['Wix — Nasdaq IPO, 2013', 'JFrog — Nasdaq IPO, 2020', 'monday.com — Nasdaq IPO, 2021', 'WalkMe — acquired by SAP, 2024', 'Run:ai — acquired by Nvidia, 2024'] }
      ]
    },
    {
      id: 'mobility', name: 'Silicon Run', sector: 'Mobility, Chips & Deep Tech', color: '#ffa94d',
      blurb: 'A country with almost no car industry that teaches cars to see — and designs the chips inside.',
      islands: [
        { name: 'Garage Cay', tagline: 'No car factories, plenty of sensors.',
          desc: 'Deep-tech crews are led by professors and veteran chip engineers from the local design centres of global semiconductor companies. The idea is usually a hard technical breakthrough rather than an app.',
          points: ['Founders from academia and chip design centres', 'Core intellectual property and patents first', 'Years, not months, to a product'],
          legends: ['Hebrew University', 'Technion', 'EcoMotion community'] },
        { name: 'Prototype Point', tagline: 'Make it work once, on a bench.',
          desc: 'Seed money buys a working prototype: a sensor on a test car, or a first chip design. Hardware costs make these seeds bigger and slower than software seeds.',
          points: ['A demo that proves the physics', 'First chip tape-out or sensor prototype', 'Larger seed rounds to pay for hardware'],
          legends: ['Innoviz', 'Hailo', 'StoreDot'] },
        { name: 'Proving-Ground Peninsula', tagline: 'Win a place in someone else’s product.',
          desc: 'Customers are carmakers, their suppliers or data-centre builders. A single design win can take years, but once the technology is designed in, it stays for a long time.',
          points: ['Design wins with carmakers and suppliers', 'Sales cycles measured in years', 'Pilots on real roads and in real cities'],
          legends: ['Mobileye', 'Via', 'Moovit'] },
        { name: 'Tier-One Terminal', tagline: 'From prototype to mass production.',
          desc: 'Growth here means factories, supply chains and automotive-grade quality — or, for mobility software, rolling out city by city across continents.',
          points: ['Mass production and quality certification', 'Global manufacturing partners', 'City-by-city international expansion'],
          legends: ['Innoviz', 'Arbe', 'Via'] },
        { name: 'Chipmaker’s Channel', tagline: 'The giants come for the engineers.',
          desc: 'The world’s largest chip and technology companies have repeatedly bought Israeli deep-tech firms and turned them into major local development centres.',
          points: ['Acquirers keep and grow the Israeli R&D team', 'Some of the largest exits in the country’s history', 'Listings for those who stay independent'],
          landings: ['Waze — acquired by Google, 2013', 'Annapurna Labs — acquired by Amazon, 2015', 'Mobileye — acquired by Intel, 2017', 'Habana Labs — acquired by Intel, 2019', 'Mellanox — acquired by Nvidia, 2020', 'Via — NYSE IPO, 2025'] }
      ]
    },
    {
      id: 'climate', name: 'Green Tide', sector: 'Climate, Agri & Food Tech', color: '#8ce99a',
      blurb: 'Born from scarcity: water, food and energy technology from a dry, crowded land.',
      islands: [
        { name: 'Kibbutz Springs', tagline: 'Scarcity is the mother of invention.',
          desc: 'Modern drip irrigation was commercialised on a desert kibbutz in the 1960s, and the tradition continues. Founders are agronomists, chemists and engineers tackling water, food and energy.',
          points: ['Founders from farms, labs and research institutes', 'Agricultural research centred around Rehovot', 'A physical problem worth solving at planet scale'],
          legends: ['Netafim (Kibbutz Hatzerim, 1965)', 'Volcani Institute'] },
        { name: 'Greenhouse Key', tagline: 'Proof in a lab, a tank or a greenhouse.',
          desc: 'Seed-stage climate and food startups need labs and equipment, so incubators and grants matter more here than on software routes.',
          points: ['Food-tech and climate incubators', 'Grant funding for capital-hungry science', 'A lab-scale proof that the process works'],
          legends: ['The Kitchen FoodTech Hub', 'Fresh Start incubator', 'Aleph Farms'] },
        { name: 'Field-Trial Flats', tagline: 'The seasons set the schedule.',
          desc: 'Series A is earned in the field: pilots with growers, utilities and food companies. Nature cannot be hurried, so a single test cycle may take a full season.',
          points: ['Pilots with growers, utilities and food brands', 'Evidence from real fields and plants', 'Regulatory approval for new foods'],
          legends: ['Taranis', 'Redefine Meat', 'Aleph Farms'] },
        { name: 'Scale-Up Delta', tagline: 'Build the first factory.',
          desc: 'The hardest crossing on this route: paying for the first full-scale plant. Companies combine venture money with corporate partners and project financing.',
          points: ['First-of-a-kind production plant', 'Corporate partners and project finance', 'Costs falling toward the incumbent’s price'],
          legends: ['SolarEdge', 'StoreDot', 'H2Pro'] },
        { name: 'Harvest Haven', tagline: 'Patient crews are rewarded.',
          desc: 'Exits take longer here, but the buyers are large industrial, agricultural and consumer groups looking for proven technology and a global footprint.',
          points: ['Industrial and agricultural giants as buyers', 'Long journeys, durable businesses', 'Public listings for energy leaders'],
          landings: ['SolarEdge — Nasdaq IPO, 2015', 'Netafim — majority sold to Mexichem (Orbia), 2018', 'SodaStream — acquired by PepsiCo, 2018', 'Prospera — acquired by Valmont, 2021'] }
      ]
    },
    {
      id: 'health', name: 'Lifeline Passage', sector: 'Digital Health, Medtech & Bio', color: '#ff9ecd',
      blurb: 'From hospital corridors and research institutes to patients worldwide.',
      islands: [
        { name: 'Lab Coat Lagoon', tagline: 'A doctor and an engineer walk onto a ship.',
          desc: 'Health startups often spin out of research institutes, universities and hospitals. The founding crew pairs a clinician or scientist with an engineer, and licenses the core invention from a technology-transfer office.',
          points: ['Clinician–engineer founding teams', 'Licences from university tech-transfer companies', 'State-backed incubators for early life science'],
          legends: ['Weizmann Institute', 'Technion', 'Hebrew University'] },
        { name: 'Pilot Ward Isle', tagline: 'Try it where the patients are.',
          desc: 'Israel’s health funds have kept digital medical records for decades, and its hospitals run innovation centres. Seed-stage teams use both to build and test a first prototype.',
          points: ['First pilot inside a hospital', 'Access to long-running digital health records', 'A prototype doctors agree to use'],
          legends: ['Sheba ARC innovation centre', 'Clalit', 'Maccabi'] },
        { name: 'Trial Tides', tagline: 'Evidence takes time.',
          desc: 'Before selling, a medical product must prove it is safe and effective. Series A pays for clinical studies and the regulatory path — a slower, costlier stage than in software.',
          points: ['Clinical studies and published results', 'Regulatory strategy for the US and Europe', 'AI products validated across many hospitals'],
          legends: ['Aidoc', 'Viz.ai', 'Nanox'] },
        { name: 'Clearance Cape', tagline: 'Approved — now get paid.',
          desc: 'With regulatory clearance in hand, the challenge becomes commercial: getting insurers to reimburse the product and building a sales team that can reach hospitals abroad.',
          points: ['FDA clearance and CE marking', 'Reimbursement from insurers', 'A commercial team in the US'],
          legends: ['InMode', 'Itamar Medical', 'Aidoc'] },
        { name: 'Strategic Harbor', tagline: 'Medical giants buy what works.',
          desc: 'Global medical-device and pharma companies prefer to acquire proven products rather than invent them, which makes acquisition the classic landing for this route.',
          points: ['Global medtech groups as natural buyers', 'Deals follow clinical and commercial proof', 'Listings for companies with strong sales'],
          landings: ['Given Imaging — acquired by Covidien, 2014', 'Mazor Robotics — acquired by Medtronic, 2018', 'InMode — Nasdaq IPO, 2019', 'Itamar Medical — acquired by ZOLL, 2021'] }
      ]
    }
  ],

  /* Cross-currents: [lane, island index] → [lane, island index], with the reason they connect. */
  crossovers: [
    { from: ['cyber', 0], to: ['fintech', 1], why: 'Fraud current — security skills flow into payments risk.' },
    { from: ['fintech', 3], to: ['cyber', 4], why: 'Identity current — fraud and identity platforms meet security buyers.' },
    { from: ['fintech', 0], to: ['consumer', 1], why: 'Wallet current — finance becomes a consumer app.' },
    { from: ['consumer', 1], to: ['ai', 2], why: 'Creator current — consumer apps turn into AI-powered tools.' },
    { from: ['ai', 3], to: ['consumer', 4], why: 'Adtech current — data platforms power games and apps.' },
    { from: ['ai', 1], to: ['cyber', 2], why: 'Developer current — tools for developers become security products.' },
    { from: ['ai', 0], to: ['mobility', 1], why: 'Vision current — machine learning moves into sensors and chips.' },
    { from: ['mobility', 3], to: ['ai', 4], why: 'Compute current — chips become the engines of AI data centres.' },
    { from: ['mobility', 1], to: ['climate', 2], why: 'Battery current — electric mobility meets energy technology.' },
    { from: ['climate', 0], to: ['health', 1], why: 'Biology current — the same labs feed food tech and medicine.' },
    { from: ['health', 3], to: ['climate', 4], why: 'Life-science current — biotech know-how flows into food and agriculture.' },
    { from: ['health', 1], to: ['ai', 2], why: 'Imaging current — medical data meets AI.' }
  ]
};
