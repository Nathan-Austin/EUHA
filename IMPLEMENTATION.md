# Heat Awards Website Migration - Implementation Document

## Overview
This document provides a step-by-step implementation plan for migrating the Heat Awards WordPress website (heatawards.eu) into the existing Next.js judging platform, creating a unified full-featured website.

---

## Audit Results

### WordPress Site - Current Pages
- **Homepage** - Competition intro, categories, deadlines, hero section
- **Prizes** - Awards structure (Gold/Silver/Bronze medals, global rankings)
- **Sponsors** - Current sponsors (Flying Goose, Chilisaus.be, Republic of Heat) + sponsorship opportunities
- **Contact** - Company info, email (heataward@gmail.com), phone, WhatsApp
- **Terms & Conditions** - Competition eligibility, entry process, judging criteria, liability
- **Enter Competition** submenu:
  - Entry Payment
  - Submit Ingredients
  - Packing Sheet

### WordPress Site - 404/Missing Pages
These links exist in navigation but return 404:
- The Judges
- Past Results
- Global Rankings
- Upcoming Chili Events

### Existing Next.js Implementation (Already Built)
✅ **Functional Pages:**
- `/` - Landing page (judging portal focused)
- `/login` - Authentication
- `/apply/supplier` - Supplier application form (Submit Ingredients)
- `/apply/judge` - Judge application form
- `/dashboard` - Role-based dashboards (admin, supplier, community judge, pro judge)
- `/judge/scan` - QR code scanner
- `/judge/score/[sauceId]` - Scoring interface
- `/payment-success` - Payment confirmation
- `/payment-cancelled` - Payment cancellation

✅ **Backend Features:**
- Supabase Edge Functions (supplier-intake, judge-intake, supplier-checkout, stripe-checkout, stripe-webhook)
- Stripe payment integration for suppliers and community judges
- QR code-based judging system
- Admin tools (sauce status, box assignment, results export)
- Image uploads to Supabase Storage

### Gap Analysis - What Needs to Be Built

**Pages to Migrate from WordPress:**
1. `/prizes` - Static content page with awards structure
2. `/sponsors` - Dynamic sponsor showcase + sponsorship CTA
3. `/contact` - Contact form + company information
4. `/terms` - Terms & conditions legal content
5. `/packing-sheet` - Downloadable packing sheet/form

**New Pages to Build (Currently 404 on WordPress):**
1. `/judges` - Judge profiles and bios page
2. `/results` or `/results/[year]` - Past competition results archive
3. `/rankings` - Global rankings system
4. `/events` - Upcoming chili events calendar

**Homepage Redesign:**
- Current homepage is judging portal focused
- Need to expand to full marketing/informational site with:
  - Competition overview and eligibility
  - Awards & prizes preview
  - Entry process walkthrough
  - Sponsor showcase
  - Judge highlights
  - Past winners
  - Newsletter signup
  - Full site navigation

---

## Proposed Navigation Structure

### Main Navigation Menu
```
- Home
- About
  - Prizes
  - The Judges
  - Terms & Conditions
- Enter Competition
  - Entry Payment → /apply/supplier
  - Submit Ingredients → /apply/supplier (same page)
  - Packing Sheet → /packing-sheet
- Results
  - Past Results → /results
  - Global Rankings → /rankings
- Events → /events
- Sponsors → /sponsors
- Contact → /contact
- Login (CTA button) → /login
```

### Footer Navigation
```
- Quick Links: Home, Login, Dashboard
- Competition: Enter, Prizes, Terms
- About: Judges, Sponsors, Contact
- Results: Past Results, Rankings
- Social: Instagram, Email
- Legal: Terms & Conditions, Privacy Policy (if needed)
- Copyright: © 2026 Heat Awards Europe
```

---

## Database Schema Extensions

### New Tables Required

#### 1. `sponsors` table
```sql
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  tier TEXT, -- 'platinum', 'gold', 'silver', 'bronze', 'partner'
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `judge_profiles` table
```sql
CREATE TABLE judge_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID REFERENCES judges(id) ON DELETE CASCADE,
  bio TEXT,
  photo_url TEXT,
  specialty TEXT, -- 'Pro Taster', 'Industry Expert', 'Community Judge'
  social_links JSONB, -- {instagram: '', website: ''}
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. `past_results` table
```sql
CREATE TABLE past_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  sauce_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  position INTEGER, -- 1, 2, 3, 4
  award_type TEXT, -- 'gold_best', 'gold', 'silver', 'bronze'
  score DECIMAL(4,2),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_past_results_year ON past_results(year);
CREATE INDEX idx_past_results_category ON past_results(category);
```

#### 4. `events` table
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  location TEXT,
  venue TEXT,
  url TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_date ON events(event_date);
```

#### 5. `contact_submissions` table (for contact form)
```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- 'new', 'read', 'replied', 'archived'
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 1: Foundation & Static Pages

### Step 1.1: Create Shared Layout Components
**Location:** `eu-hot-sauce-awards/src/components/`

**Files to Create:**
- `components/Navigation.tsx` - Main navigation menu with dropdowns
- `components/Footer.tsx` - Site-wide footer with all links
- `components/Hero.tsx` - Reusable hero section component
- `components/SectionContainer.tsx` - Consistent section wrapper

**Implementation Notes:**
- Use the existing dark theme (#08040e background, orange/amber accents)
- Make navigation responsive with mobile menu
- Add active link highlighting
- Ensure accessibility (ARIA labels, keyboard navigation)

### Step 1.2: Update Root Layout
**File:** `eu-hot-sauce-awards/src/app/layout.tsx`

**Changes:**
- Import and add `<Navigation />` component
- Import and add `<Footer />` component (conditionally hide on judging/dashboard pages)
- Update metadata for SEO (title, description, OG tags)

### Step 1.3: Create Prizes Page
**File:** `eu-hot-sauce-awards/src/app/prizes/page.tsx`

**Content Structure:**
```
- Hero: "Prizes & Recognition"
- Award Levels Section:
  - Gold Medal Best in Category (5 stars) - 1st place
  - Gold Medal (4 stars) - 2 winners
  - Silver Medal (3 stars) - 5 winners
  - Bronze Medal (2 stars) - 10 winners
- Winner's Package Section:
  - Commemorative certificate
  - Winner's merchandise (bottle stickers)
  - Digital badges and press releases
- Global Rankings Section:
  - Top 20 sauces get special certificate
  - Placement in international rankings
- CTA: "Enter Competition" button
```

### Step 1.4: Create Sponsors Page
**File:** `eu-hot-sauce-awards/src/app/sponsors/page.tsx`

**Content Structure:**
```
- Hero: "Our Sponsors"
- Current Sponsors Section:
  - Logo grid (Flying Goose, Chilisaus.be)
- Become a Sponsor Section:
  - Benefits: Logo on social media, printed on awards, featured at Berlin Chili Festival
  - Contact: Neil Numb, heataward@gmail.com, (+49) 017682204595
- CTA: "Sponsorship Inquiry" button (links to contact form)
```

**Database Integration:**
- Fetch sponsors from `sponsors` table (to be created)
- Filter by `active = true`
- Order by `display_order`

### Step 1.5: Create Contact Page
**File:** `eu-hot-sauce-awards/src/app/contact/page.tsx`

**Content Structure:**
```
- Hero: "Get in Touch"
- Contact Information:
  - Company: Chili Punk Berlin
  - Email: heataward@gmail.com
  - Phone: +4917682204595
  - WhatsApp link
  - Address: Heat Awards, Neil Long CO/ Saunders, Neißestraße 2, 12051 Berlin, Germany
  - VAT: DE314890098
- Contact Form:
  - Fields: Name, Email, Subject, Message
  - Submit button
- Social Links: Instagram
```

**Backend Required:**
- Create Edge Function: `supabase/functions/contact-form/index.ts`
- Insert submissions into `contact_submissions` table
- Send notification email to heataward@gmail.com

### Step 1.6: Create Terms & Conditions Page
**File:** `eu-hot-sauce-awards/src/app/terms/page.tsx`

**Content Structure:**
```
- Hero: "Terms & Conditions"
- Sections:
  1. Competition Eligibility
  2. Entry Process
  3. Judging Criteria
  4. Intellectual Property
  5. Liability Limitations
  6. Communication & Contact
```

### Step 1.7: Create Packing Sheet Page
**File:** `eu-hot-sauce-awards/src/app/packing-sheet/page.tsx`

**Content Structure:**
```
- Hero: "Packing & Shipping Guidelines"
- Instructions for shipping samples
- Downloadable PDF link
- Deadline reminder: 28 February 2026
- Shipping address display
- DHL integration info (if applicable)
```

**Optional Enhancement:**
- Generate dynamic PDF with supplier's sauce details
- QR code for tracking

---

## Phase 2: Homepage Redesign

### Step 2.1: Redesign Homepage Sections
**File:** `eu-hot-sauce-awards/src/app/page.tsx`

**New Section Order:**
1. **Hero Section** (existing, enhance)
   - Add background image/video
   - Clearer CTAs: "Enter Competition", "Apply to Judge", "View Prizes"

2. **Welcome & Introduction** (new)
   - Brief overview of EU Hot Sauce Awards
   - Mission statement
   - 2026 edition highlights

3. **Competition Categories** (existing, expand)
   - Current: Heritage & Tradition, Innovation & Fusion, Sustainable Fire
   - Add: Chili Sauce categories from WordPress
   - Add: Specialty categories

4. **Awards & Prizes Preview** (new)
   - Showcase medal tiers visually
   - Link to full `/prizes` page
   - Highlight global rankings opportunity

5. **Step-by-Step Entry Process** (new)
   - 1. Complete online payment
   - 2. Submit ingredients list
   - 3. Ship samples by deadline
   - 4. Judging weekend (April 11-12)
   - 5. Results announcement
   - Visual timeline/infographic

6. **Key Dates Timeline** (existing, keep)
   - Current milestones section is good

7. **Stats Section** (existing, keep)
   - Countries, sauces, judges

8. **Sponsors Showcase** (new)
   - Logo grid of current sponsors
   - "Become a Sponsor" CTA

9. **Featured Judges Preview** (new)
   - Show 3-4 featured judges with photos
   - Link to full `/judges` page

10. **Past Winners Highlight** (new)
    - Carousel of recent winners
    - Link to `/results` page

11. **Newsletter Subscription** (new)
    - Mailchimp integration
    - "Stay updated on events and results"

12. **Footer** (update with full navigation)

### Step 2.2: Add Hero Images/Assets
**Assets Needed:**
- Hero background image (high-quality hot sauce/chili themed)
- Sponsor logos (Flying Goose, Chilisaus.be)
- Award medal graphics (gold, silver, bronze)
- Judge profile photos

**Storage:**
- Upload to Supabase Storage bucket
- Or use `/public` directory for static assets

### Step 2.3: Implement Newsletter Subscription
**Component:** `components/NewsletterSignup.tsx`

**Integration:**
- Mailchimp API or embedded form
- Or create custom Edge Function to handle subscriptions
- Store in database if managing internally

---

## Phase 3: Dynamic Features

### Step 3.1: Build Judge Profiles System

#### Step 3.1.1: Database Setup
**Migration:** `supabase/migrations/YYYYMMDDHHMMSS_create_judge_profiles.sql`
- Create `judge_profiles` table (see schema above)
- Add RLS policies (admin can manage, public can read active profiles)

#### Step 3.1.2: Admin Interface
**Component:** `app/dashboard/JudgeProfileManager.tsx`
- CRUD interface for managing judge profiles
- Upload photo to Supabase Storage
- Set featured status
- Reorder display order

#### Step 3.1.3: Public Judges Page
**File:** `app/judges/page.tsx`

**Content Structure:**
```
- Hero: "Meet Our Judges"
- Featured Judges Section (featured = true)
- All Judges Grid
  - Filter by specialty (Pro, Community, Industry)
  - Search by name
- Each judge card:
  - Photo
  - Name
  - Specialty
  - Bio
  - Social links (if any)
```

### Step 3.2: Build Past Results System

#### Step 3.2.1: Database Setup
**Migration:** `supabase/migrations/YYYYMMDDHHMMSS_create_past_results.sql`
- Create `past_results` table (see schema above)
- Add RLS policies (admin can manage, public can read)

#### Step 3.2.2: Admin Interface
**Component:** `app/dashboard/ResultsManager.tsx`
- Import results from CSV
- Manually add/edit results
- Link to supplier records
- Upload winner photos

#### Step 3.2.3: Public Results Pages
**File:** `app/results/page.tsx` - Results archive landing page

**Content Structure:**
```
- Hero: "Past Results"
- Year selector (2024, 2025, etc.)
- Links to each year's results
```

**File:** `app/results/[year]/page.tsx` - Year-specific results

**Content Structure:**
```
- Hero: "2025 Winners"
- Category tabs/sections
- Winners list per category:
  - Sauce name
  - Supplier name
  - Award type (gold, silver, bronze)
  - Score (optional)
  - Image (optional)
- Download results as PDF/CSV
```

### Step 3.3: Build Global Rankings System

#### Step 3.3.1: Rankings Logic
**File:** `app/actions.ts` - Add server action

**Function:** `calculateGlobalRankings(year: number)`
- Query all sauces for given year
- Calculate weighted scores (pro: 0.8, community: 1.5, supplier: 0.8)
- Return top 20 sauces sorted by score

#### Step 3.3.2: Public Rankings Page
**File:** `app/rankings/page.tsx`

**Content Structure:**
```
- Hero: "Global Rankings"
- Year selector
- Top 20 List:
  - Rank (#1-20)
  - Sauce name
  - Supplier name
  - Final score
  - Country flag
  - Award badges
- Methodology explanation
```

### Step 3.4: Build Events Calendar

#### Step 3.4.1: Database Setup
**Migration:** `supabase/migrations/YYYYMMDDHHMMSS_create_events.sql`
- Create `events` table (see schema above)
- Add RLS policies

#### Step 3.4.2: Admin Interface
**Component:** `app/dashboard/EventsManager.tsx`
- Add/edit/delete events
- Set featured status
- Manage active/inactive

#### Step 3.4.3: Public Events Page
**File:** `app/events/page.tsx`

**Content Structure:**
```
- Hero: "Upcoming Chili Events"
- Featured events section
- Calendar view or list view
- Filter by date/location
- Event cards:
  - Title
  - Date
  - Location
  - Description
  - Link/Register button
- Add to calendar functionality (Google Calendar export)
```

---

## Phase 4: Data Migration & Seeding

### Step 4.1: Migrate Sponsor Data
**Script:** `scripts/seed-sponsors.ts`

**Data to Migrate:**
```typescript
const sponsors = [
  {
    name: "Flying Goose Brand",
    logo_url: "/sponsors/flying-goose.png",
    website: "https://flyinggoosebrand.com",
    tier: "gold",
    display_order: 1,
    active: true
  },
  {
    name: "Chilisaus.be",
    logo_url: "/sponsors/chilisaus.png",
    website: "https://chilisaus.be",
    tier: "gold",
    display_order: 2,
    active: true
  }
];
```

### Step 4.2: Seed Judge Profiles (if available)
**Script:** `scripts/seed-judges.ts`
- If judge data exists, import bios and photos
- Otherwise, add placeholder for admin to fill in

### Step 4.3: Import Historical Results (if available)
**Script:** `scripts/seed-past-results.ts`
- If past competition data exists in spreadsheets/databases
- Import into `past_results` table
- Map to existing `suppliers` if possible

### Step 4.4: Add Sample Events
**Script:** `scripts/seed-events.ts`
- Add Berlin Chili Festival
- Add judging weekend dates
- Add any other known events

---

## Phase 5: Integration & Polish

### Step 5.1: Update Existing Pages
- Update `/apply/supplier` to link to `/packing-sheet`
- Update `/apply/supplier` to link to `/terms`
- Add "View Prizes" link to application pages
- Update `/dashboard` to link to new admin management pages

### Step 5.2: SEO & Metadata
**Files to Update:**
- `app/layout.tsx` - Root metadata
- Each page's metadata export
- Add `robots.txt`
- Add `sitemap.xml` (generate dynamically)
- Add OG images for social sharing

### Step 5.3: Responsive Design Review
- Test all new pages on mobile, tablet, desktop
- Ensure navigation menu works on mobile
- Test forms on mobile devices
- Optimize images for different screen sizes

### Step 5.4: Accessibility Audit
- Add ARIA labels to interactive elements
- Ensure keyboard navigation works
- Check color contrast ratios
- Add alt text to all images
- Test with screen reader

### Step 5.5: Performance Optimization
- Lazy load images
- Optimize image sizes (use Next.js Image component)
- Minimize bundle size
- Add loading states for dynamic content
- Implement caching strategies

---

## Phase 6: WordPress Decommission (Optional)

### Step 6.1: URL Redirects
**File:** `next.config.js` - Add redirects

```javascript
redirects: async () => [
  { source: '/prizes', destination: '/prizes', permanent: true },
  { source: '/sponsors', destination: '/sponsors', permanent: true },
  { source: '/the-judges', destination: '/judges', permanent: true },
  { source: '/past-results', destination: '/results', permanent: true },
  { source: '/global-rankings', destination: '/rankings', permanent: true },
  { source: '/upcoming-chili-events', destination: '/events', permanent: true },
  { source: '/contact', destination: '/contact', permanent: true },
  { source: '/terms-and-conditions', destination: '/terms', permanent: true },
  // Add more as needed
]
```

### Step 6.2: Content Backup
- Export all WordPress content
- Save images locally
- Archive database dump
- Document any custom functionality

### Step 6.3: DNS Update
- Point heatawards.eu to new Next.js deployment
- Set up SSL certificate
- Test all functionality on production domain
- Monitor for broken links

---

## Technical Implementation Notes

### Environment Variables Required
**Frontend (.env.local):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SAUCE_IMAGE_BUCKET=
NEXT_PUBLIC_SITE_URL=https://heatawards.eu
```

**Supabase Secrets:**
```
MAILCHIMP_API_KEY=  # If using Mailchimp
MAILCHIMP_LIST_ID=  # If using Mailchimp
CONTACT_EMAIL=heataward@gmail.com
```

### New Edge Functions Needed
1. **contact-form** - Handle contact form submissions
2. **newsletter-subscribe** - Handle newsletter signups (if not using Mailchimp directly)

### Image Assets Checklist
- [ ] Sponsor logos (Flying Goose, Chilisaus.be)
- [ ] Award medal graphics (gold, silver, bronze)
- [ ] Hero background images
- [ ] Judge profile photos
- [ ] Past winner photos (if available)
- [ ] Event images

### Design System Consistency
**Colors (from current implementation):**
- Background: `#08040e` (very dark purple)
- Primary: `#ff4d00` (bright orange)
- Secondary: `#f1b12e` (amber/gold)
- Accent: `#f1b12e` with 80% opacity
- Text: white with various opacities (80%, 70%, 60%)

**Typography:**
- Headings: font-semibold
- Body: text-base to text-lg
- Labels: text-xs uppercase tracking-wide

**Components:**
- Rounded corners: rounded-2xl, rounded-3xl, rounded-full
- Borders: border-white/10, border-white/20
- Backgrounds: bg-white/5, bg-white/10
- Backdrop blur for cards
- Gradient buttons: from-[#ff4d00] to-[#f1b12e]

---

## Testing Checklist

### Functionality Testing
- [ ] Navigation menu works on all pages
- [ ] All internal links work correctly
- [ ] Forms submit successfully
- [ ] Database queries return correct data
- [ ] Authentication redirects work properly
- [ ] Payment flows still work
- [ ] Admin functions still work
- [ ] Image uploads work

### Cross-Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Testing
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large desktop (1920px+)

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Images optimized
- [ ] No console errors
- [ ] Fast page load times

---

## Launch Checklist

- [ ] All pages created and tested
- [ ] Database migrations applied
- [ ] Content migrated from WordPress
- [ ] Images uploaded
- [ ] Forms tested and working
- [ ] SEO metadata added
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] SSL certificate configured
- [ ] DNS pointed to new site
- [ ] WordPress backup completed
- [ ] URL redirects in place
- [ ] Analytics configured
- [ ] Error tracking configured
- [ ] Performance optimized
- [ ] Accessibility tested
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Final client review completed

---

## Maintenance & Future Enhancements

### Ongoing Maintenance
- Regular content updates (events, judges, sponsors)
- Results entry after each competition
- Judge profile updates
- Sponsor updates
- Security patches

### Future Enhancement Ideas
- Multi-language support (German, French, Dutch)
- Public sauce gallery/catalog
- Live judging scores (real-time leaderboard)
- Sauce voting by community
- Integration with social media feeds
- Mobile app for judges
- Advanced analytics dashboard for admin
- Email marketing automation
- Supplier dashboard enhancements (track package, view results)

---

## Support & Contact

**Development Questions:**
- Repository: /home/nathan/EUHA
- Documentation: CLAUDE.md

**Heat Awards Contact:**
- Email: heataward@gmail.com
- Phone: +4917682204595
- Address: Neißestraße 2, 12051 Berlin, Germany