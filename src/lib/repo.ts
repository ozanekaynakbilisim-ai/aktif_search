export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string;
  isHighCpc: boolean;
  popularQueries: string[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  heroImage: string;
  content: string;
  author: string;
  publishDate: string;
  status: 'draft' | 'published';
  categoryId: string;
  wordCount: number;
  disableAds: boolean;
  cseKeyword?: string; // Custom CSE search keyword
}

export interface Query {
  id: string;
  text: string;
  categoryId: string;
  isPopular: boolean;
}

export interface ReferenceSite {
  id: string;
  name: string;
  url: string;
  category: string;
  notes: string;
}

// Seeded data
export const categories: Category[] = [
  {
    id: '1',
    name: 'Credit Cards',
    slug: 'credit-cards',
    description: 'Find the best credit cards for your needs, compare rewards, and learn how to build credit.',
    heroImage: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    isHighCpc: true,
    popularQueries: [
      'best credit cards 2025',
      'cash back credit cards',
      'travel rewards credit cards',
      'credit cards for bad credit',
      'business credit cards',
      'student credit cards',
      'credit card comparison',
      'credit card approval odds'
    ]
  },
  {
    id: '2',
    name: 'Personal Loans',
    slug: 'personal-loans',
    description: 'Compare personal loan rates, terms, and lenders to find the right financing solution.',
    heroImage: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
    isHighCpc: true,
    popularQueries: [
      'best personal loan rates',
      'personal loans for bad credit',
      'debt consolidation loans',
      'personal loan calculator',
      'instant personal loans',
      'online personal loans',
      'personal loan requirements',
      'personal loan vs credit card'
    ]
  },
  {
    id: '3',
    name: 'Banking',
    slug: 'banking',
    description: 'Discover the best banks, checking accounts, savings accounts, and banking services.',
    heroImage: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800',
    isHighCpc: true,
    popularQueries: [
      'best online banks',
      'high yield savings accounts',
      'checking account bonuses',
      'business banking',
      'mobile banking apps',
      'bank account fees',
      'credit union vs bank',
      'banking for students'
    ]
  },
  {
    id: '4',
    name: 'Investing',
    slug: 'investing',
    description: 'Learn about stocks, bonds, ETFs, and investment strategies to grow your wealth.',
    heroImage: 'https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&w=800',
    isHighCpc: true,
    popularQueries: [
      'best investment apps',
      'how to start investing',
      'stock market for beginners',
      'retirement investing',
      'index fund investing',
      'real estate investing',
      'cryptocurrency investing',
      'investment calculator'
    ]
  },
  {
    id: '5',
    name: 'Insurance',
    slug: 'insurance',
    description: 'Compare insurance policies and find the best coverage for your needs and budget.',
    heroImage: 'https://images.pexels.com/photos/1556691/pexels-photo-1556691.jpeg?auto=compress&cs=tinysrgb&w=800',
    isHighCpc: true,
    popularQueries: [
      'auto insurance quotes',
      'life insurance rates',
      'health insurance plans',
      'home insurance comparison',
      'insurance for young drivers',
      'cheap car insurance',
      'term life insurance',
      'insurance calculator'
    ]
  }
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'Best Credit Cards for 2025: Expert Reviews and Comparisons',
    slug: 'best-credit-cards-2025',
    excerpt: 'Discover the top credit cards of 2025 with our comprehensive comparison of rewards, rates, and benefits.',
    heroImage: 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800',
    content: `# Best Credit Cards for 2025: Expert Reviews and Comparisons

Finding the right credit card can significantly impact your financial well-being. With hundreds of options available, choosing the best credit card requires careful consideration of your spending habits, credit score, and financial goals.

## Top Credit Card Categories

### Cash Back Credit Cards
Cash back cards offer straightforward rewards that put money directly back in your pocket. The best cash back cards typically offer:

- Flat-rate rewards of 1.5% to 2% on all purchases
- Rotating quarterly categories with up to 5% back
- Bonus categories like groceries, gas, and dining

### Travel Rewards Credit Cards
For frequent travelers, travel rewards cards can provide exceptional value through:

- Sign-up bonuses worth $500-$1,000 in travel
- Earning 2-5x points on travel and dining purchases
- Premium perks like airport lounge access and travel credits

### Balance Transfer Credit Cards
If you're carrying debt, balance transfer cards can help you save money with:

- 0% introductory APR periods of 12-21 months
- Low or no balance transfer fees
- Opportunity to pay down debt without interest charges

## How to Choose the Right Credit Card

Consider these factors when selecting a credit card:

1. **Your Credit Score**: Your score determines which cards you'll qualify for
2. **Spending Patterns**: Choose rewards that match how you spend
3. **Annual Fees**: Ensure the benefits outweigh any annual costs
4. **Interest Rates**: Important if you carry a balance
5. **Sign-up Bonuses**: Can provide immediate value

## Building Credit Responsibly

Using credit cards responsibly can help build your credit score:

- Pay your full balance each month
- Keep utilization below 30% of your credit limit
- Make payments on time, every time
- Don't close old accounts unnecessarily

The best credit card is one that aligns with your financial habits and helps you achieve your goals while building positive credit history.`,
    author: 'Finance Authority Editorial Team',
    publishDate: '2025-01-01',
    status: 'published',
    categoryId: '1',
    wordCount: 320,
    disableAds: false
  },
  {
    id: '2',
    title: 'Personal Loan vs Credit Card: Which Is Right for You?',
    slug: 'personal-loan-vs-credit-card',
    excerpt: 'Compare personal loans and credit cards to determine the best financing option for your situation.',
    heroImage: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800',
    content: `# Personal Loan vs Credit Card: Which Is Right for You?

When you need to finance a major purchase or consolidate debt, you typically have two main options: a personal loan or a credit card. Understanding the differences between these financing methods can help you make the best decision for your financial situation.

## Personal Loans: Fixed Terms and Predictable Payments

Personal loans offer several advantages for specific financial needs:

### Benefits of Personal Loans
- **Fixed interest rates**: Your rate won't change over the life of the loan
- **Predictable payments**: Same payment amount each month
- **Lower interest rates**: Often lower than credit card rates for qualified borrowers
- **Fixed repayment timeline**: Typically 2-7 years

### When to Choose a Personal Loan
Personal loans work best for:
- Debt consolidation with high-interest credit cards
- Large one-time expenses like home improvements
- Major purchases with a clear repayment plan
- When you want predictable monthly payments

## Credit Cards: Flexibility and Ongoing Access

Credit cards provide different advantages:

### Benefits of Credit Cards
- **Revolving credit**: Access to funds as needed
- **Rewards programs**: Earn cash back, points, or miles
- **Build credit history**: Regular use and payments improve credit score
- **Purchase protection**: Many cards offer extended warranties and fraud protection

### When to Choose a Credit Card
Credit cards are ideal for:
- Ongoing expenses and everyday purchases
- Emergency funds and unexpected costs
- Taking advantage of rewards programs
- Building or rebuilding credit history

## Interest Rates and Costs

### Personal Loan Rates
- Average rates: 6% to 36% depending on credit score
- Fixed rates provide payment certainty
- No rewards but lower overall cost for large balances

### Credit Card Rates
- Average rates: 18% to 29% for most cards
- Variable rates can change with market conditions
- Potential for 0% introductory periods

## Making the Right Choice

Consider these factors when deciding:

1. **Purpose**: One-time expense (loan) vs ongoing access (card)
2. **Amount needed**: Large amounts often better with loans
3. **Repayment timeline**: Fixed timeline (loan) vs flexible (card)
4. **Interest rates**: Compare actual rates you qualify for
5. **Fees**: Origination fees vs annual fees
6. **Credit impact**: Both can help build credit when used responsibly

## The Bottom Line

Personal loans excel for large, one-time expenses with a clear repayment plan, while credit cards offer flexibility for ongoing purchases and the opportunity to earn rewards. The best choice depends on your specific financial needs, creditworthiness, and repayment preferences.

For many people, a combination of both - a personal loan for major expenses and a credit card for everyday purchases - provides the most comprehensive financial toolkit.`,
    author: 'Sarah Johnson, CFP',
    publishDate: '2025-01-02',
    status: 'published',
    categoryId: '2',
    wordCount: 485,
    disableAds: false
  }
];

export const referenceSites: ReferenceSite[] = [
  { id: '1', name: 'Bankrate', url: 'bankrate.com', category: 'General Finance', notes: 'Major financial comparison site' },
  { id: '2', name: 'NerdWallet', url: 'nerdwallet.com', category: 'Personal Finance', notes: 'Financial advice and tools' },
  { id: '3', name: 'Credit Karma', url: 'creditkarma.com', category: 'Credit', notes: 'Credit monitoring and advice' },
  { id: '4', name: 'The Balance Money', url: 'thebalancemoney.com', category: 'Personal Finance', notes: 'Financial education' },
  { id: '5', name: 'ValuePenguin', url: 'valuepenguin.com', category: 'Insurance', notes: 'Insurance comparison' },
  { id: '6', name: 'CreditCards.com', url: 'creditcards.com', category: 'Credit Cards', notes: 'Credit card comparison' },
  { id: '7', name: 'SmartAsset', url: 'smartasset.com', category: 'Investing', notes: 'Investment tools and advice' },
  { id: '8', name: 'Money Saving Expert', url: 'moneysavingexpert.com', category: 'Savings', notes: 'UK money saving tips' },
  { id: '9', name: 'Investopedia', url: 'investopedia.com', category: 'Education', notes: 'Financial education' },
  { id: '10', name: 'Finder', url: 'finder.com', category: 'Comparison', notes: 'Financial product comparison' }
];

// Repository abstraction for easy swapping later
class Repository<T extends { id: string }> {
  constructor(private storageKey: string, private defaultData: T[]) {}

  getAll(): T[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : this.defaultData;
  }

  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  create(item: Omit<T, 'id'>): T {
    const newItem = { ...item, id: Date.now().toString() } as T;
    const items = this.getAll();
    items.push(newItem);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    return true;
  }
}

export const categoryRepo = new Repository('categories', categories);
export const articleRepo = new Repository('articles', articles);
export const referenceSiteRepo = new Repository('reference-sites', referenceSites);

// Helper function to get site articles for CSE integration
export function getArticlesForCSE(): Array<{
  title: string;
  url: string;
  description: string;
  category: string;
}> {
  const allArticles = articleRepo.getAll().filter(a => a.status === 'published');
  const allCategories = categoryRepo.getAll();
  
  return allArticles.map(article => {
    const category = allCategories.find(c => c.id === article.categoryId);
    return {
      title: article.title,
      url: `/article/${article.slug}`,
      description: article.excerpt,
      category: category?.name || 'General'
    };
  });
}