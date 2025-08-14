-- FinanceAdd MySQL Database Schema
-- cPanel MySQL için veritabanı yapısı

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text NOT NULL,
  `hero_image` varchar(500) DEFAULT NULL,
  `is_high_cpc` tinyint(1) DEFAULT 0,
  `popular_queries` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_high_cpc` (`is_high_cpc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Makaleler tablosu
CREATE TABLE IF NOT EXISTS `articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `slug` varchar(500) NOT NULL UNIQUE,
  `excerpt` text NOT NULL,
  `hero_image` varchar(500) DEFAULT NULL,
  `content` longtext NOT NULL,
  `author` varchar(255) NOT NULL,
  `publish_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `status` enum('draft','published') DEFAULT 'draft',
  `category_id` int(11) NOT NULL,
  `word_count` int(11) DEFAULT 0,
  `disable_ads` tinyint(1) DEFAULT 0,
  `cse_keyword` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_slug` (`slug`),
  KEY `idx_category` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_publish_date` (`publish_date`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Referans siteler tablosu
CREATE TABLE IF NOT EXISTS `reference_sites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(500) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin ayarları tablosu
CREATE TABLE IF NOT EXISTS `admin_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(255) NOT NULL UNIQUE,
  `setting_value` longtext DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayılan kategoriler
INSERT INTO `categories` (`name`, `slug`, `description`, `hero_image`, `is_high_cpc`, `popular_queries`) VALUES
('Credit Cards', 'credit-cards', 'Find the best credit cards for your needs, compare rewards, and learn how to build credit.', 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800', 1, '["best credit cards 2025", "cash back credit cards", "travel rewards credit cards", "credit cards for bad credit", "business credit cards", "student credit cards", "credit card comparison", "credit card approval odds"]'),
('Personal Loans', 'personal-loans', 'Compare personal loan rates, terms, and lenders to find the right financing solution.', 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800', 1, '["best personal loan rates", "personal loans for bad credit", "debt consolidation loans", "personal loan calculator", "instant personal loans", "online personal loans", "personal loan requirements", "personal loan vs credit card"]'),
('Banking', 'banking', 'Discover the best banks, checking accounts, savings accounts, and banking services.', 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=800', 1, '["best online banks", "high yield savings accounts", "checking account bonuses", "business banking", "mobile banking apps", "bank account fees", "credit union vs bank", "banking for students"]'),
('Investing', 'investing', 'Learn about stocks, bonds, ETFs, and investment strategies to grow your wealth.', 'https://images.pexels.com/photos/187041/pexels-photo-187041.jpeg?auto=compress&cs=tinysrgb&w=800', 1, '["best investment apps", "how to start investing", "stock market for beginners", "retirement investing", "index fund investing", "real estate investing", "cryptocurrency investing", "investment calculator"]'),
('Insurance', 'insurance', 'Compare insurance policies and find the best coverage for your needs and budget.', 'https://images.pexels.com/photos/1556691/pexels-photo-1556691.jpeg?auto=compress&cs=tinysrgb&w=800', 1, '["auto insurance quotes", "life insurance rates", "health insurance plans", "home insurance comparison", "insurance for young drivers", "cheap car insurance", "term life insurance", "insurance calculator"]');

-- Varsayılan makaleler
INSERT INTO `articles` (`title`, `slug`, `excerpt`, `hero_image`, `content`, `author`, `status`, `category_id`, `word_count`) VALUES
('Best Credit Cards for 2025: Expert Reviews and Comparisons', 'best-credit-cards-2025', 'Discover the top credit cards of 2025 with our comprehensive comparison of rewards, rates, and benefits.', 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800', '<h2>Best Credit Cards for 2025: Expert Reviews and Comparisons</h2><p>Finding the right credit card can significantly impact your financial well-being. With hundreds of options available, choosing the best credit card requires careful consideration of your spending habits, credit score, and financial goals.</p><h2>Top Credit Card Categories</h2><h3>Cash Back Credit Cards</h3><p>Cash back cards offer straightforward rewards that put money directly back in your pocket. The best cash back cards typically offer:</p><ul><li>Flat-rate rewards of 1.5% to 2% on all purchases</li><li>Rotating quarterly categories with up to 5% back</li><li>Bonus categories like groceries, gas, and dining</li></ul><h3>Travel Rewards Credit Cards</h3><p>For frequent travelers, travel rewards cards can provide exceptional value through:</p><ul><li>Sign-up bonuses worth $500-$1,000 in travel</li><li>Earning 2-5x points on travel and dining purchases</li><li>Premium perks like airport lounge access and travel credits</li></ul>', 'Finance Authority Editorial Team', 'published', 1, 320),
('Personal Loan vs Credit Card: Which Is Right for You?', 'personal-loan-vs-credit-card', 'Compare personal loans and credit cards to determine the best financing option for your situation.', 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=800', '<h2>Personal Loan vs Credit Card: Which Is Right for You?</h2><p>When you need to finance a major purchase or consolidate debt, you typically have two main options: a personal loan or a credit card. Understanding the differences between these financing methods can help you make the best decision for your financial situation.</p><h2>Personal Loans: Fixed Terms and Predictable Payments</h2><p>Personal loans offer several advantages for specific financial needs:</p><h3>Benefits of Personal Loans</h3><ul><li><strong>Fixed interest rates</strong>: Your rate won\'t change over the life of the loan</li><li><strong>Predictable payments</strong>: Same payment amount each month</li><li><strong>Lower interest rates</strong>: Often lower than credit card rates for qualified borrowers</li><li><strong>Fixed repayment timeline</strong>: Typically 2-7 years</li></ul>', 'Sarah Johnson, CFP', 'published', 2, 485);

-- Varsayılan referans siteler
INSERT INTO `reference_sites` (`name`, `url`, `category`, `notes`) VALUES
('Bankrate', 'bankrate.com', 'General Finance', 'Major financial comparison site'),
('NerdWallet', 'nerdwallet.com', 'Personal Finance', 'Financial advice and tools'),
('Credit Karma', 'creditkarma.com', 'Credit', 'Credit monitoring and advice'),
('The Balance Money', 'thebalancemoney.com', 'Personal Finance', 'Financial education'),
('ValuePenguin', 'valuepenguin.com', 'Insurance', 'Insurance comparison');

-- Varsayılan admin ayarları
INSERT INTO `admin_settings` (`setting_key`, `setting_value`) VALUES
('site_name', 'FinanceAdd'),
('site_description', 'Expert financial advice and tools to help you make informed decisions about credit, loans, investing, and personal finance.'),
('contact_email', 'contact@financeadd.com'),
('google_cse_id', '7301314c507bb45cf'),
('news_api_key', 'e227184aaeae4694bcc1f8ecb89e6ed6'),
('news_api_enabled', '1');

COMMIT;