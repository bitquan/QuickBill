import type { IndustryTemplate, TemplateCategory } from "../types/template";

export const INDUSTRY_TEMPLATES: TemplateCategory[] = [
  {
    id: "freelancers",
    name: "Freelancers & Consultants",
    description: "Templates for creative professionals and consultants",
    templates: [
      {
        id: "web-developer",
        name: "Web Developer",
        category: "freelancers",
        description: "For web development projects and maintenance",
        icon: "💻",
        isPro: true,
        tags: ["hourly", "project-based", "technology", "remote"],
        complexity: "standard",
        defaultItems: [
          {
            description: "Frontend Development",
            unitPrice: 75,
            quantity: 10,
            unit: "hour",
          },
          {
            description: "Backend Development",
            unitPrice: 85,
            quantity: 8,
            unit: "hour",
          },
          {
            description: "Testing & Debugging",
            unitPrice: 65,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Project Management",
            unitPrice: 70,
            quantity: 2,
            unit: "hour",
          },
        ],
        variations: [
          {
            id: "small-website",
            name: "Small Website",
            description: "Perfect for small business websites or landing pages",
            useCase: "1-5 page website with basic functionality",
            estimatedValue: 2500,
            items: [
              {
                description: "Website Design & Development",
                unitPrice: 1200,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Content Integration",
                unitPrice: 300,
                quantity: 1,
                unit: "project",
              },
              {
                description: "SEO Setup",
                unitPrice: 400,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Training & Documentation",
                unitPrice: 300,
                quantity: 1,
                unit: "project",
              },
              {
                description: "30-day Support",
                unitPrice: 300,
                quantity: 1,
                unit: "project",
              },
            ],
            notes:
              "Includes responsive design, contact forms, and basic SEO. Additional pages $200 each.",
          },
          {
            id: "ecommerce-site",
            name: "E-commerce Website",
            description: "Full-featured online store with payment processing",
            useCase: "Online store with product catalog and checkout",
            estimatedValue: 8500,
            items: [
              {
                description: "E-commerce Development",
                unitPrice: 4000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Payment Gateway Integration",
                unitPrice: 800,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Product Catalog Setup",
                unitPrice: 1200,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Inventory Management",
                unitPrice: 1000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Admin Training",
                unitPrice: 500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "3-month Support",
                unitPrice: 1000,
                quantity: 1,
                unit: "project",
              },
            ],
            notes:
              "Includes SSL certificate, shipping calculator, and order management system.",
          },
          {
            id: "web-app",
            name: "Custom Web Application",
            description: "Complex web application with custom functionality",
            useCase: "Custom business applications or SaaS platforms",
            estimatedValue: 15000,
            items: [
              {
                description: "Application Architecture",
                unitPrice: 125,
                quantity: 20,
                unit: "hour",
              },
              {
                description: "Backend Development",
                unitPrice: 95,
                quantity: 60,
                unit: "hour",
              },
              {
                description: "Frontend Development",
                unitPrice: 85,
                quantity: 40,
                unit: "hour",
              },
              {
                description: "Database Design",
                unitPrice: 100,
                quantity: 16,
                unit: "hour",
              },
              {
                description: "API Development",
                unitPrice: 90,
                quantity: 24,
                unit: "hour",
              },
              {
                description: "Testing & QA",
                unitPrice: 75,
                quantity: 20,
                unit: "hour",
              },
            ],
            notes:
              "Includes user authentication, data analytics, and deployment to cloud infrastructure.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "50% deposit required to start project, remaining 50% upon completion",
          cancellationPolicy:
            "Project can be cancelled with 7 days written notice. Completed work will be billed.",
          warrantyInfo:
            "90-day warranty on all development work. Hosting and domain not included.",
          additionalTerms: [
            "Client responsible for providing all content and materials",
            "Additional revisions beyond 3 rounds will be charged at hourly rate",
            "Source code ownership transfers upon final payment",
            "Hosting setup and domain registration available for additional fee",
          ],
        },
        timeline: {
          estimatedDuration: "2-8 weeks depending on project scope",
          milestones: [
            {
              name: "Design Approval",
              percentage: 25,
              description: "Wireframes and visual design completed",
            },
            {
              name: "Development Phase 1",
              percentage: 50,
              description: "Core functionality implemented",
            },
            {
              name: "Testing & Revisions",
              percentage: 75,
              description: "Quality assurance and client feedback",
            },
            {
              name: "Launch & Training",
              percentage: 100,
              description: "Site goes live with client training",
            },
          ],
        },
        defaultNotes:
          "Payment terms: Net 30 days. Additional revisions beyond scope will be charged at hourly rate.",
        defaultTaxRate: 0,
      },
      {
        id: "graphic-designer",
        name: "Graphic Designer",
        category: "freelancers",
        description: "For design projects and creative services",
        icon: "🎨",
        isPro: true,
        defaultItems: [
          {
            description: "Logo Design",
            unitPrice: 500,
            quantity: 1,
            unit: "project",
          },
          {
            description: "Brand Guidelines",
            unitPrice: 300,
            quantity: 1,
            unit: "project",
          },
          {
            description: "Business Card Design",
            unitPrice: 150,
            quantity: 1,
            unit: "project",
          },
          {
            description: "Revisions",
            unitPrice: 75,
            quantity: 2,
            unit: "hour",
          },
        ],
        defaultNotes:
          "Includes 3 rounds of revisions. Additional revisions charged at hourly rate. Final files delivered in AI, PDF, and PNG formats.",
        defaultTaxRate: 0,
      },
      {
        id: "business-consultant",
        name: "Business Consultant",
        category: "freelancers",
        description: "For consulting and advisory services",
        icon: "📊",
        isPro: true,
        defaultItems: [
          {
            description: "Business Strategy Consultation",
            unitPrice: 150,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Market Analysis",
            unitPrice: 125,
            quantity: 6,
            unit: "hour",
          },
          {
            description: "Process Optimization",
            unitPrice: 135,
            quantity: 8,
            unit: "hour",
          },
          {
            description: "Implementation Support",
            unitPrice: 100,
            quantity: 4,
            unit: "hour",
          },
        ],
        defaultNotes:
          "Consultation includes follow-up sessions and written recommendations. Travel expenses billed separately if applicable.",
        defaultTaxRate: 0,
      },
      {
        id: "content-creator",
        name: "Writer/Content Creator",
        category: "freelancers",
        description: "For writing and content creation services",
        icon: "✍️",
        isPro: true,
        defaultItems: [
          {
            description: "Blog Post Writing",
            unitPrice: 0.25,
            quantity: 2000,
            unit: "word",
          },
          {
            description: "SEO Optimization",
            unitPrice: 100,
            quantity: 1,
            unit: "project",
          },
          {
            description: "Content Strategy",
            unitPrice: 75,
            quantity: 3,
            unit: "hour",
          },
          {
            description: "Proofreading & Editing",
            unitPrice: 50,
            quantity: 2,
            unit: "hour",
          },
        ],
        defaultNotes:
          "Includes one round of revisions. Additional edits charged at hourly rate. Content delivered in specified format.",
        defaultTaxRate: 0,
      },
      {
        id: "digital-marketing",
        name: "Digital Marketing",
        category: "freelancers",
        description: "For digital marketing and advertising services",
        icon: "📱",
        isPro: true,
        tags: ["recurring", "remote", "analytics", "social-media"],
        complexity: "standard",
        defaultItems: [
          {
            description: "Social Media Management",
            unitPrice: 800,
            quantity: 1,
            unit: "month",
          },
          {
            description: "Content Creation",
            unitPrice: 150,
            quantity: 8,
            unit: "post",
          },
          {
            description: "Ad Campaign Setup",
            unitPrice: 300,
            quantity: 1,
            unit: "campaign",
          },
          {
            description: "Analytics & Reporting",
            unitPrice: 200,
            quantity: 1,
            unit: "month",
          },
        ],
        variations: [
          {
            id: "starter-package",
            name: "Starter Social Media",
            description:
              "Essential social media management for small businesses",
            useCase:
              "Small businesses getting started with social media marketing",
            estimatedValue: 1200,
            items: [
              {
                description: "Social Media Strategy",
                unitPrice: 300,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Content Creation (12 posts)",
                unitPrice: 600,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Platform Management (2 platforms)",
                unitPrice: 200,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Monthly Analytics Report",
                unitPrice: 100,
                quantity: 1,
                unit: "month",
              },
            ],
            notes:
              "Perfect for businesses new to social media. Includes Facebook and Instagram management with basic analytics.",
          },
          {
            id: "growth-package",
            name: "Growth Marketing Package",
            description: "Comprehensive marketing for growing businesses",
            useCase:
              "Established businesses looking to scale their digital presence",
            estimatedValue: 2500,
            items: [
              {
                description: "Multi-Platform Management (4 platforms)",
                unitPrice: 1000,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Content Creation (20 posts)",
                unitPrice: 800,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Paid Ad Management",
                unitPrice: 500,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Email Marketing Campaign",
                unitPrice: 200,
                quantity: 1,
                unit: "month",
              },
            ],
            notes:
              "Includes Facebook, Instagram, LinkedIn, Twitter management plus Google Ads. Ad spend billed separately.",
          },
          {
            id: "enterprise-package",
            name: "Enterprise Marketing",
            description: "Full-service digital marketing for large businesses",
            useCase:
              "Large businesses needing comprehensive marketing solutions",
            estimatedValue: 5000,
            items: [
              {
                description: "Comprehensive Strategy Development",
                unitPrice: 1500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Multi-Channel Management",
                unitPrice: 2000,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Content & Creative Production",
                unitPrice: 1200,
                quantity: 1,
                unit: "month",
              },
              {
                description: "Advanced Analytics & BI",
                unitPrice: 300,
                quantity: 1,
                unit: "month",
              },
            ],
            notes:
              "Includes all platforms, advanced reporting, dedicated account manager, and quarterly strategy reviews.",
          },
          {
            id: "campaign-launch",
            name: "Product Launch Campaign",
            description:
              "Intensive marketing campaign for product or service launches",
            useCase:
              "New product launches, grand openings, major announcements",
            estimatedValue: 3500,
            items: [
              {
                description: "Launch Strategy & Planning",
                unitPrice: 800,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Creative Asset Development",
                unitPrice: 1200,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Multi-Platform Campaign Execution",
                unitPrice: 1000,
                quantity: 1,
                unit: "campaign",
              },
              {
                description: "Influencer Outreach",
                unitPrice: 300,
                quantity: 1,
                unit: "campaign",
              },
              {
                description: "Performance Monitoring & Optimization",
                unitPrice: 200,
                quantity: 1,
                unit: "campaign",
              },
            ],
            notes:
              "6-week intensive campaign with pre-launch, launch, and post-launch phases. Perfect for major announcements.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Monthly retainer due in advance. Setup fees due upon project start.",
          cancellationPolicy:
            "30-day written notice required. No refunds on completed work or ad spend.",
          warrantyInfo:
            "Performance guarantees based on agreed KPIs. Monthly optimization included in retainer.",
          additionalTerms: [
            "Client provides access to social media accounts and relevant platforms",
            "Ad spend managed separately and billed monthly with receipts",
            "Content approval process requires 48-hour turnaround from client",
            "Monthly strategy calls included in all packages",
            "Additional revisions beyond scope charged at hourly rate of $125",
            "Analytics access and training provided to client team",
          ],
        },
        timeline: {
          estimatedDuration:
            "Ongoing monthly retainer with 3-month minimum commitment",
          milestones: [
            {
              name: "Strategy & Setup",
              percentage: 25,
              description:
                "Account setup, strategy development, content calendar",
            },
            {
              name: "Content Production",
              percentage: 50,
              description: "Create and schedule content for first month",
            },
            {
              name: "Campaign Launch",
              percentage: 75,
              description: "Launch campaigns and begin optimization",
            },
            {
              name: "Optimization & Reporting",
              percentage: 100,
              description: "Ongoing optimization and monthly reporting",
            },
          ],
        },
        defaultNotes:
          "Monthly retainer includes content calendar, posting, and monthly report. Ad spend billed separately.",
        defaultTaxRate: 0,
      },
    ],
  },
  {
    id: "service-providers",
    name: "Service Providers",
    description: "Templates for personal and home services",
    templates: [
      {
        id: "cleaning-service",
        name: "Cleaning Service",
        category: "service-providers",
        description: "For residential and commercial cleaning",
        icon: "🧹",
        isPro: true,
        tags: ["recurring", "local", "residential", "commercial"],
        complexity: "simple",
        defaultItems: [
          {
            description: "Deep Cleaning Service",
            unitPrice: 150,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Regular Maintenance Cleaning",
            unitPrice: 80,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Window Cleaning",
            unitPrice: 50,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Carpet Cleaning",
            unitPrice: 2,
            quantity: 500,
            unit: "sq ft",
          },
        ],
        variations: [
          {
            id: "move-in-cleaning",
            name: "Move-In Deep Clean",
            description: "Comprehensive cleaning for new home move-ins",
            useCase:
              "New home preparation, post-construction cleanup, move-in ready",
            estimatedValue: 350,
            items: [
              {
                description: "Complete Deep Clean (3-4 hours)",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Interior Window Cleaning",
                unitPrice: 75,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Cabinet Interior Cleaning",
                unitPrice: 50,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Appliance Deep Clean",
                unitPrice: 25,
                quantity: 1,
                unit: "service",
              },
            ],
            notes:
              "Perfect for new homeowners. Includes cleaning inside all cabinets, drawers, and appliances. Add carpet cleaning for additional fee.",
          },
          {
            id: "weekly-service",
            name: "Weekly Cleaning Service",
            description: "Regular weekly maintenance cleaning subscription",
            useCase:
              "Ongoing weekly cleaning for busy families and professionals",
            estimatedValue: 320,
            items: [
              {
                description: "Weekly Cleaning Service",
                unitPrice: 80,
                quantity: 4,
                unit: "week",
              },
            ],
            notes:
              "Monthly billing for 4 weekly cleanings. 10% discount for 6+ month commitment. Holiday schedule adjustments included.",
          },
          {
            id: "office-cleaning",
            name: "Office Cleaning",
            description: "Commercial office and workspace cleaning",
            useCase: "Small offices, retail spaces, professional buildings",
            estimatedValue: 600,
            items: [
              {
                description: "Office Cleaning (per visit)",
                unitPrice: 150,
                quantity: 4,
                unit: "visit",
              },
            ],
            notes:
              "Monthly service includes trash removal, restroom sanitizing, and common area cleaning. After-hours service available.",
          },
          {
            id: "post-party-cleanup",
            name: "Post-Event Cleanup",
            description: "Comprehensive cleanup after parties and events",
            useCase:
              "After parties, gatherings, special events, holiday cleanup",
            estimatedValue: 275,
            items: [
              {
                description: "Event Cleanup Service",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Trash Removal & Disposal",
                unitPrice: 50,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Floor Deep Clean",
                unitPrice: 25,
                quantity: 1,
                unit: "service",
              },
            ],
            notes:
              "Same-day or next-day service available. Perfect for getting your home back to normal after hosting.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Payment due upon completion of service. Monthly services billed in advance.",
          cancellationPolicy:
            "24-hour cancellation notice required. Same-day cancellations charged 50% of service fee.",
          warrantyInfo:
            "100% satisfaction guarantee. We'll return within 24 hours to address any concerns at no charge.",
          additionalTerms: [
            "All cleaning supplies and equipment provided",
            "Bonded and insured for your protection",
            "Pet-friendly and eco-friendly cleaning products available upon request",
            "Secure key holding service available for regular clients",
            "Holiday surcharge may apply for services on major holidays",
            "Parking must be available within reasonable distance of property",
          ],
        },
        timeline: {
          estimatedDuration:
            "2-6 hours depending on home size and service type",
        },
        defaultNotes:
          "All cleaning supplies provided. Satisfaction guaranteed. Payment due upon completion.",
        defaultTaxRate: 8.25,
      },
      {
        id: "landscaping",
        name: "Landscaping",
        category: "service-providers",
        description: "For lawn care and landscaping services",
        icon: "🌿",
        isPro: true,
        tags: [
          "seasonal",
          "maintenance",
          "design",
          "installation",
          "commercial",
        ],
        complexity: "standard",
        defaultItems: [
          {
            description: "Lawn Mowing & Edging",
            unitPrice: 45,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Hedge Trimming",
            unitPrice: 75,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Mulch Installation",
            unitPrice: 8,
            quantity: 10,
            unit: "yard",
          },
          {
            description: "Seasonal Cleanup",
            unitPrice: 120,
            quantity: 1,
            unit: "service",
          },
        ],
        variations: [
          {
            id: "weekly-maintenance",
            name: "Weekly Lawn Maintenance",
            description: "Complete weekly lawn care service",
            useCase: "Regular maintenance for 1/4 acre residential property",
            estimatedValue: 180,
            items: [
              {
                description: "Lawn Mowing & Edging",
                unitPrice: 45,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Hedge Trimming",
                unitPrice: 35,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Leaf Blowing & Cleanup",
                unitPrice: 25,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Weekly Service (4 visits)",
                unitPrice: 18.75,
                quantity: 4,
                unit: "week",
              },
            ],
          },
          {
            id: "spring-cleanup",
            name: "Spring Cleanup Package",
            description: "Comprehensive spring preparation service",
            useCase: "Seasonal cleanup and preparation for growing season",
            estimatedValue: 650,
            items: [
              {
                description: "Debris Removal & Cleanup",
                unitPrice: 85,
                quantity: 4,
                unit: "hour",
              },
              {
                description: "Mulch Installation",
                unitPrice: 8,
                quantity: 15,
                unit: "yard",
              },
              {
                description: "Pruning & Trimming",
                unitPrice: 75,
                quantity: 3,
                unit: "hour",
              },
              {
                description: "Fertilizer Application",
                unitPrice: 95,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "landscape-design",
            name: "Landscape Design & Install",
            description: "Complete landscape design and installation",
            useCase:
              "Front yard landscape renovation with plants and hardscape",
            estimatedValue: 3200,
            items: [
              {
                description: "Design Consultation",
                unitPrice: 150,
                quantity: 2,
                unit: "hour",
              },
              {
                description: "Plant Installation",
                unitPrice: 85,
                quantity: 12,
                unit: "hour",
              },
              {
                description: "Plants & Materials",
                unitPrice: 1200,
                quantity: 1,
                unit: "allowance",
              },
              {
                description: "Soil Preparation",
                unitPrice: 450,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Hardscape Installation",
                unitPrice: 1100,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "snow-removal",
            name: "Snow Removal Service",
            description: "Winter snow removal and ice management",
            useCase: "Seasonal snow removal for driveways and walkways",
            estimatedValue: 1200,
            items: [
              {
                description: "Snow Plowing (per visit)",
                unitPrice: 45,
                quantity: 15,
                unit: "visit",
              },
              {
                description: "Sidewalk Shoveling",
                unitPrice: 25,
                quantity: 15,
                unit: "visit",
              },
              {
                description: "Ice/Salt Application",
                unitPrice: 35,
                quantity: 10,
                unit: "application",
              },
              {
                description: "Season Contract Discount",
                unitPrice: -375,
                quantity: 1,
                unit: "discount",
              },
            ],
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Monthly service payments due by 15th. Project work requires 50% deposit.",
          cancellationPolicy:
            "Service can be cancelled with 30 days written notice. Seasonal contracts non-refundable.",
          warrantyInfo:
            "30-day warranty on plant installations. Weather-related damage excluded.",
          additionalTerms: [
            "Licensed and insured landscaping contractor",
            "Service dependent on weather conditions",
            "Customer responsible for water access",
            "Seasonal pricing may apply",
            "Materials sourced from certified nurseries",
            "Cleanup and disposal included in service",
          ],
        },
        timeline: {
          estimatedDuration: "1 day to 2 weeks depending on project scope",
          milestones: [
            {
              name: "Site Assessment",
              percentage: 20,
              description: "Evaluate property and create service plan",
            },
            {
              name: "Material Procurement",
              percentage: 40,
              description: "Source plants, materials, and equipment",
            },
            {
              name: "Installation/Service",
              percentage: 80,
              description: "Complete landscaping work",
            },
            {
              name: "Final Inspection",
              percentage: 100,
              description: "Quality check and client walkthrough",
            },
          ],
        },
        defaultNotes:
          "Weekly service agreement. Materials included in pricing. Weather permitting schedules.",
        defaultTaxRate: 8.25,
      },
      {
        id: "personal-trainer",
        name: "Personal Trainer",
        category: "service-providers",
        description: "For fitness and training services",
        icon: "💪",
        isPro: true,
        tags: ["fitness", "health", "wellness", "1-on-1", "group-training"],
        complexity: "simple",
        defaultItems: [
          {
            description: "Personal Training Session",
            unitPrice: 65,
            quantity: 8,
            unit: "session",
          },
          {
            description: "Fitness Assessment",
            unitPrice: 50,
            quantity: 1,
            unit: "assessment",
          },
          {
            description: "Nutrition Consultation",
            unitPrice: 75,
            quantity: 1,
            unit: "consultation",
          },
          {
            description: "Custom Workout Plan",
            unitPrice: 100,
            quantity: 1,
            unit: "plan",
          },
        ],
        variations: [
          {
            id: "starter-package",
            name: "Fitness Starter Package",
            description: "Perfect introduction to personal training",
            useCase: "4 sessions with assessment and basic plan",
            estimatedValue: 395,
            items: [
              {
                description: "Fitness Assessment",
                unitPrice: 50,
                quantity: 1,
                unit: "assessment",
              },
              {
                description: "Personal Training Sessions",
                unitPrice: 65,
                quantity: 4,
                unit: "session",
              },
              {
                description: "Basic Workout Plan",
                unitPrice: 85,
                quantity: 1,
                unit: "plan",
              },
            ],
          },
          {
            id: "transformation-program",
            name: "12-Week Transformation",
            description: "Comprehensive fitness transformation program",
            useCase: "Complete 12-week body transformation with nutrition",
            estimatedValue: 1680,
            items: [
              {
                description: "Personal Training Sessions",
                unitPrice: 65,
                quantity: 24,
                unit: "session",
              },
              {
                description: "Nutrition Consultations",
                unitPrice: 75,
                quantity: 4,
                unit: "consultation",
              },
              {
                description: "Custom Meal Plans",
                unitPrice: 60,
                quantity: 3,
                unit: "plan",
              },
              {
                description: "Progress Assessments",
                unitPrice: 50,
                quantity: 3,
                unit: "assessment",
              },
            ],
          },
          {
            id: "group-training",
            name: "Small Group Training",
            description: "Semi-private training for 2-4 people",
            useCase: "Monthly group training package for 3 people",
            estimatedValue: 480,
            items: [
              {
                description: "Group Training Sessions (3 people)",
                unitPrice: 40,
                quantity: 12,
                unit: "session",
              },
            ],
          },
          {
            id: "online-coaching",
            name: "Online Coaching Program",
            description: "Virtual fitness coaching and support",
            useCase: "4-week online coaching with weekly check-ins",
            estimatedValue: 320,
            items: [
              {
                description: "Weekly Virtual Check-ins",
                unitPrice: 45,
                quantity: 4,
                unit: "session",
              },
              {
                description: "Custom Workout Programs",
                unitPrice: 80,
                quantity: 2,
                unit: "program",
              },
            ],
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Payment due before each session. Package payments receive 10% discount.",
          cancellationPolicy:
            "24-hour cancellation notice required. Late cancellations forfeit session.",
          warrantyInfo:
            "Satisfaction guaranteed. Unused sessions transferable within 6 weeks.",
          additionalTerms: [
            "Certified personal trainer - CPR/AED certified",
            "Liability waiver required before first session",
            "Client responsible for medical clearance if needed",
            "Sessions expire 6 weeks from purchase date",
            "No-show policy: 50% charge for missed appointments",
            "Equipment and facility access included",
          ],
        },
        timeline: {
          estimatedDuration: "1 hour per session, package duration varies",
          milestones: [
            {
              name: "Initial Assessment",
              percentage: 10,
              description: "Fitness evaluation and goal setting",
            },
            {
              name: "Program Design",
              percentage: 20,
              description: "Create customized workout plan",
            },
            {
              name: "Training Sessions",
              percentage: 80,
              description: "Complete scheduled training sessions",
            },
            {
              name: "Progress Review",
              percentage: 100,
              description: "Evaluate progress and plan next steps",
            },
          ],
        },
        defaultNotes:
          "Package of 8 sessions valid for 6 weeks. Cancellations require 24-hour notice.",
        defaultTaxRate: 0,
      },
      {
        id: "photography",
        name: "Photography",
        category: "service-providers",
        description: "For photography and photo services",
        icon: "📸",
        isPro: true,
        tags: ["creative", "event-based", "hourly", "package-deals"],
        complexity: "standard",
        defaultItems: [
          {
            description: "Portrait Photography Session",
            unitPrice: 200,
            quantity: 1,
            unit: "session",
          },
          {
            description: "Photo Editing",
            unitPrice: 5,
            quantity: 50,
            unit: "photo",
          },
          {
            description: "Travel Fee",
            unitPrice: 50,
            quantity: 1,
            unit: "fee",
          },
          {
            description: "Print Package",
            unitPrice: 150,
            quantity: 1,
            unit: "package",
          },
        ],
        variations: [
          {
            id: "headshot-package",
            name: "Professional Headshots",
            description: "Corporate headshots and professional portraits",
            useCase:
              "Business professionals, LinkedIn profiles, corporate teams",
            estimatedValue: 350,
            items: [
              {
                description: "Studio Headshot Session (1 hour)",
                unitPrice: 200,
                quantity: 1,
                unit: "session",
              },
              {
                description: "Professional Editing",
                unitPrice: 75,
                quantity: 1,
                unit: "service",
              },
              {
                description: "High-Resolution Digital Files",
                unitPrice: 50,
                quantity: 1,
                unit: "package",
              },
              {
                description: "Print Release",
                unitPrice: 25,
                quantity: 1,
                unit: "license",
              },
            ],
            notes:
              "Includes 3-5 final edited images. Additional retouching available. Same-day turnaround for rush orders (+$100).",
          },
          {
            id: "wedding-photography",
            name: "Wedding Photography",
            description: "Complete wedding day photography coverage",
            useCase: "Full wedding day coverage from preparation to reception",
            estimatedValue: 2500,
            items: [
              {
                description: "8-Hour Wedding Coverage",
                unitPrice: 1500,
                quantity: 1,
                unit: "event",
              },
              {
                description: "Engagement Session",
                unitPrice: 300,
                quantity: 1,
                unit: "session",
              },
              {
                description: "Professional Editing (300+ photos)",
                unitPrice: 400,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Online Gallery",
                unitPrice: 100,
                quantity: 1,
                unit: "service",
              },
              {
                description: "USB Drive with All Images",
                unitPrice: 75,
                quantity: 1,
                unit: "package",
              },
              {
                description: "Print Release",
                unitPrice: 50,
                quantity: 1,
                unit: "license",
              },
              {
                description: "Travel within 50 miles",
                unitPrice: 75,
                quantity: 1,
                unit: "fee",
              },
            ],
            notes:
              "Includes 300+ edited high-resolution images. Second shooter available for +$500. Albums and prints available separately.",
          },
          {
            id: "event-photography",
            name: "Corporate Event",
            description:
              "Business events, conferences, and corporate functions",
            useCase:
              "Corporate events, conferences, grand openings, team building",
            estimatedValue: 800,
            items: [
              {
                description: "4-Hour Event Coverage",
                unitPrice: 500,
                quantity: 1,
                unit: "event",
              },
              {
                description: "Professional Editing",
                unitPrice: 150,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Same-Day Preview Gallery",
                unitPrice: 75,
                quantity: 1,
                unit: "service",
              },
              {
                description: "High-Resolution Digital Delivery",
                unitPrice: 50,
                quantity: 1,
                unit: "package",
              },
              {
                description: "Commercial Usage Rights",
                unitPrice: 25,
                quantity: 1,
                unit: "license",
              },
            ],
            notes:
              "Perfect for marketing materials and social media. 48-hour delivery guaranteed. Additional hours at $125/hour.",
          },
          {
            id: "family-portraits",
            name: "Family Portrait Session",
            description: "Outdoor or studio family photography session",
            useCase: "Family photos, holiday cards, milestone celebrations",
            estimatedValue: 450,
            items: [
              {
                description: "1.5-Hour Photo Session",
                unitPrice: 250,
                quantity: 1,
                unit: "session",
              },
              {
                description: "Professional Editing (20 images)",
                unitPrice: 100,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Online Proofing Gallery",
                unitPrice: 25,
                quantity: 1,
                unit: "service",
              },
              {
                description: "High-Resolution Downloads",
                unitPrice: 50,
                quantity: 1,
                unit: "package",
              },
              {
                description: "Print Release",
                unitPrice: 25,
                quantity: 1,
                unit: "license",
              },
            ],
            notes:
              "Includes 20 professionally edited images. Additional editing at $5 per image. Outfit changes welcome.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "50% retainer required to secure date, balance due on day of session",
          cancellationPolicy:
            "72-hour cancellation notice required. Weather-related rescheduling at no charge.",
          warrantyInfo:
            "Digital files backed up for 2 years. Re-editing available within 30 days at no charge.",
          additionalTerms: [
            "Client receives usage rights for personal use unless commercial license purchased",
            "Photographer retains copyright and may use images for portfolio/marketing",
            "Raw/unedited files are not provided",
            "Delivery timeline: 2-3 weeks for standard editing, 1 week for rush (+50%)",
            "Weather backup plan will be discussed for outdoor sessions",
            "Additional travel beyond 25 miles charged at $1 per mile",
          ],
        },
        timeline: {
          estimatedDuration: "1-8 hours depending on session type",
          milestones: [
            {
              name: "Consultation & Planning",
              percentage: 25,
              description: "Discuss vision, location, and logistics",
            },
            {
              name: "Photo Session",
              percentage: 50,
              description: "Complete photography session",
            },
            {
              name: "Editing & Selection",
              percentage: 75,
              description: "Professional editing and image selection",
            },
            {
              name: "Final Delivery",
              percentage: 100,
              description: "Digital gallery and file delivery",
            },
          ],
        },
        defaultNotes:
          "Session includes 1-2 hours of shooting. Edited photos delivered within 2 weeks. Print release included.",
        defaultTaxRate: 8.25,
      },
      {
        id: "event-planning",
        name: "Event Planning",
        category: "service-providers",
        description: "For event planning and coordination services",
        icon: "🎉",
        isPro: true,
        tags: [
          "weddings",
          "corporate",
          "parties",
          "coordination",
          "full-service",
        ],
        complexity: "advanced",
        defaultItems: [
          {
            description: "Event Planning & Coordination",
            unitPrice: 1500,
            quantity: 1,
            unit: "event",
          },
          {
            description: "Vendor Coordination",
            unitPrice: 75,
            quantity: 10,
            unit: "hour",
          },
          {
            description: "Day-of Coordination",
            unitPrice: 500,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Setup & Breakdown",
            unitPrice: 300,
            quantity: 1,
            unit: "service",
          },
        ],
        variations: [
          {
            id: "wedding-planning",
            name: "Full Wedding Planning",
            description: "Complete wedding planning and coordination service",
            useCase: "150-guest wedding with 6 months planning",
            estimatedValue: 4500,
            items: [
              {
                description: "Wedding Planning (6 months)",
                unitPrice: 2500,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Vendor Coordination",
                unitPrice: 75,
                quantity: 20,
                unit: "hour",
              },
              {
                description: "Day-of Coordination",
                unitPrice: 800,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Setup & Breakdown",
                unitPrice: 450,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Rehearsal Coordination",
                unitPrice: 275,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "corporate-event",
            name: "Corporate Event Management",
            description: "Professional corporate event planning and execution",
            useCase: "100-person corporate conference or gala",
            estimatedValue: 3200,
            items: [
              {
                description: "Event Planning & Strategy",
                unitPrice: 1800,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Vendor Management",
                unitPrice: 75,
                quantity: 12,
                unit: "hour",
              },
              {
                description: "Day-of Coordination",
                unitPrice: 600,
                quantity: 1,
                unit: "service",
              },
              {
                description: "AV & Tech Coordination",
                unitPrice: 400,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "birthday-party",
            name: "Birthday Party Planning",
            description: "Fun and memorable birthday party coordination",
            useCase: "50-guest adult birthday party or kids party",
            estimatedValue: 1200,
            items: [
              {
                description: "Party Planning & Design",
                unitPrice: 600,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Vendor Coordination",
                unitPrice: 75,
                quantity: 4,
                unit: "hour",
              },
              {
                description: "Day-of Coordination",
                unitPrice: 300,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Setup & Cleanup",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "day-of-coordination",
            name: "Day-of Coordination Only",
            description: "Event coordination for pre-planned events",
            useCase: "Day-of coordination for self-planned wedding or event",
            estimatedValue: 800,
            items: [
              {
                description: "Final Planning Meeting",
                unitPrice: 100,
                quantity: 1,
                unit: "meeting",
              },
              {
                description: "Day-of Coordination",
                unitPrice: 500,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Setup Supervision",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
            ],
          },
        ],
        defaultTerms: {
          paymentTerms:
            "50% deposit to secure date, 25% at 60 days prior, 25% final payment 7 days prior to event",
          cancellationPolicy:
            "Cancellations more than 90 days: 50% refund. 30-90 days: 25% refund. Less than 30 days: non-refundable",
          warrantyInfo:
            "Satisfaction guarantee on coordination services. Vendor performance not guaranteed.",
          additionalTerms: [
            "Licensed and insured event planning business",
            "Client responsible for vendor payments unless specified",
            "Final headcount required 7 days prior to event",
            "Weather contingency plans included for outdoor events",
            "Additional coordination time billed at $75/hour",
            "Travel fees may apply for venues over 30 miles",
          ],
        },
        timeline: {
          estimatedDuration:
            "3-12 months planning period depending on event size",
          milestones: [
            {
              name: "Initial Consultation",
              percentage: 10,
              description: "Event vision, budget, and timeline planning",
            },
            {
              name: "Vendor Selection",
              percentage: 40,
              description: "Book venue, catering, and key vendors",
            },
            {
              name: "Final Details",
              percentage: 80,
              description: "Finalize timeline, guest count, and logistics",
            },
            {
              name: "Event Execution",
              percentage: 100,
              description: "Day-of coordination and event management",
            },
          ],
        },
        defaultNotes:
          "Full-service event planning. Vendor payments handled separately. Final headcount due 7 days prior.",
        defaultTaxRate: 8.25,
      },
    ],
  },
  {
    id: "trade-construction",
    name: "Trade & Construction",
    description: "Templates for contractors and skilled trades",
    templates: [
      {
        id: "general-contractor",
        name: "General Contractor",
        category: "trade-construction",
        description: "For construction and renovation projects",
        icon: "🔨",
        isPro: true,
        tags: ["construction", "renovation", "project-based", "local"],
        complexity: "advanced",
        defaultItems: [
          {
            description: "Project Management",
            unitPrice: 85,
            quantity: 40,
            unit: "hour",
          },
          {
            description: "Skilled Labor",
            unitPrice: 65,
            quantity: 80,
            unit: "hour",
          },
          {
            description: "Materials & Supplies",
            unitPrice: 5000,
            quantity: 1,
            unit: "allowance",
          },
          {
            description: "Permits & Inspections",
            unitPrice: 500,
            quantity: 1,
            unit: "fee",
          },
        ],
        variations: [
          {
            id: "kitchen-remodel",
            name: "Kitchen Remodel",
            description: "Complete kitchen renovation with modern finishes",
            useCase:
              "Full kitchen renovation including cabinets, countertops, appliances",
            estimatedValue: 35000,
            items: [
              {
                description: "Design & Planning",
                unitPrice: 2500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Demolition",
                unitPrice: 3000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Electrical Work",
                unitPrice: 4000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Plumbing",
                unitPrice: 3500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Cabinet Installation",
                unitPrice: 8000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Countertop Installation",
                unitPrice: 4500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Flooring",
                unitPrice: 3500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Painting & Finishing",
                unitPrice: 2500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Final Inspection & Cleanup",
                unitPrice: 3500,
                quantity: 1,
                unit: "project",
              },
            ],
            notes:
              "Includes all labor, basic materials allowance of $15,000. Premium upgrades available. Timeline: 4-6 weeks.",
          },
          {
            id: "bathroom-renovation",
            name: "Bathroom Renovation",
            description: "Modern bathroom renovation with quality fixtures",
            useCase:
              "Complete bathroom remodel including tile, fixtures, vanity",
            estimatedValue: 18000,
            items: [
              {
                description: "Design & Planning",
                unitPrice: 1500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Demolition",
                unitPrice: 1800,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Plumbing Rough-in",
                unitPrice: 2500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Electrical Work",
                unitPrice: 2000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Tile Work",
                unitPrice: 4500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Fixture Installation",
                unitPrice: 2200,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Vanity & Countertop",
                unitPrice: 2500,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Painting & Finishing",
                unitPrice: 1000,
                quantity: 1,
                unit: "project",
              },
            ],
            notes:
              "Includes standard fixtures and materials. Custom tile and premium fixtures available for additional cost.",
          },
          {
            id: "home-addition",
            name: "Home Addition",
            description: "Room addition or home expansion project",
            useCase:
              "Adding square footage with foundation, framing, and finishing",
            estimatedValue: 85000,
            items: [
              {
                description: "Architectural Plans & Permits",
                unitPrice: 5000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Foundation Work",
                unitPrice: 12000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Framing & Roofing",
                unitPrice: 18000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Electrical Rough-in",
                unitPrice: 8000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Plumbing Rough-in",
                unitPrice: 6000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Insulation & Drywall",
                unitPrice: 10000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Flooring Installation",
                unitPrice: 8000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Interior Finishing",
                unitPrice: 12000,
                quantity: 1,
                unit: "project",
              },
              {
                description: "Final Inspections",
                unitPrice: 6000,
                quantity: 1,
                unit: "project",
              },
            ],
            notes:
              "Price per 400 sq ft addition. Includes standard materials and finishes. Timeline: 3-4 months.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "30% deposit, 40% at substantial completion, 30% upon final completion",
          cancellationPolicy:
            "Project can be cancelled with 14 days written notice. Work completed will be billed in full.",
          warrantyInfo:
            "2-year warranty on workmanship, 1-year on materials. Manufacturer warranties apply to fixtures.",
          additionalTerms: [
            "All work performed according to local building codes and regulations",
            "Change orders must be approved in writing and may affect timeline",
            "Client responsible for obtaining HOA approvals if applicable",
            "Weather delays may affect project timeline",
            "All permits and inspections included in base price",
            "Final payment due within 7 days of completion and approval",
          ],
        },
        timeline: {
          estimatedDuration: "2-16 weeks depending on project scope",
          milestones: [
            {
              name: "Permits & Planning",
              percentage: 15,
              description: "Permits obtained, materials ordered",
            },
            {
              name: "Rough Work",
              percentage: 40,
              description: "Demolition, framing, rough electrical/plumbing",
            },
            {
              name: "Installation Phase",
              percentage: 75,
              description: "Finishes, fixtures, and major installations",
            },
            {
              name: "Final Completion",
              percentage: 100,
              description: "Final inspections, cleanup, and walkthrough",
            },
          ],
        },
        defaultNotes:
          "50% deposit required to start. Materials billed at cost plus 15%. Change orders require written approval.",
        defaultTaxRate: 8.25,
      },
      {
        id: "electrician",
        name: "Electrician",
        category: "trade-construction",
        description: "For electrical work and installations",
        icon: "⚡",
        isPro: true,
        tags: ["licensed", "insured", "emergency", "residential", "commercial"],
        complexity: "standard",
        customizable: true,
        popularity: 85,
        defaultItems: [
          {
            description: "Electrical Installation",
            unitPrice: 95,
            quantity: 8,
            unit: "hour",
          },
          {
            description: "Service Call/Diagnostic",
            unitPrice: 125,
            quantity: 1,
            unit: "call",
          },
          {
            description: "Materials & Parts",
            unitPrice: 300,
            quantity: 1,
            unit: "allowance",
          },
          {
            description: "Permit & Inspection",
            unitPrice: 150,
            quantity: 1,
            unit: "fee",
          },
        ],
        // Enhanced Features: Portfolio
        portfolio: {
          images: [
            {
              id: "elec-1",
              url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
              title: "Electrical Panel Upgrade",
              description: "200 amp service upgrade with modern breaker panel",
              category: "residential",
              isPrimary: true,
            },
            {
              id: "elec-2",
              url: "https://images.unsplash.com/photo-1574328131634-4d6e8e67f0e1?w=800",
              title: "Smart Home Wiring",
              description: "Complete smart home electrical installation",
              category: "smart-home",
            },
            {
              id: "elec-3",
              url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
              title: "Commercial Lighting",
              description: "LED lighting upgrade for office building",
              category: "commercial",
            },
          ],
          testimonials: [
            {
              id: "test-1",
              clientName: "Sarah Johnson",
              clientTitle: "Homeowner",
              rating: 5,
              text: "Outstanding electrical work! Professional, clean, and explained everything clearly. Panel upgrade was completed on time and passed inspection perfectly.",
              projectType: "Panel Upgrade",
              date: "March 2024",
            },
            {
              id: "test-2",
              clientName: "Mike Chen",
              clientTitle: "Property Manager",
              rating: 5,
              text: "Reliable and skilled electrician. Has done multiple properties for us. Always punctual and work is top quality.",
              projectType: "Commercial Wiring",
              date: "January 2024",
            },
          ],
          certifications: [
            {
              id: "cert-1",
              name: "Master Electrician License",
              issuedBy: "State Electrical Board",
              licenseNumber: "ME-12345",
              expirationDate: "2026-12-31",
            },
            {
              id: "cert-2",
              name: "OSHA 30-Hour Construction",
              issuedBy: "OSHA",
              licenseNumber: "OSHA-30-67890",
              expirationDate: "2025-08-15",
            },
          ],
          beforeAfter: [
            {
              id: "ba-1",
              beforeUrl:
                "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
              afterUrl:
                "https://images.unsplash.com/photo-1574328131634-4d6e8e67f0e1?w=400",
              title: "Old Panel to Smart Panel",
              description:
                "Upgraded from 100-amp fuse box to 200-amp smart panel",
              projectValue: 2200,
            },
          ],
        },
        // Enhanced Features: Seasonal Pricing
        seasonalPricing: [
          {
            season: "winter",
            modifier: 1.15,
            description:
              "Winter rates - High demand for indoor electrical work",
            startDate: "12-01",
            endDate: "02-28",
            applicableItems: [
              "Electrical Installation",
              "Service Call/Diagnostic",
            ],
          },
          {
            season: "spring",
            modifier: 0.9,
            description: "Spring special - Best time for electrical upgrades",
            startDate: "03-01",
            endDate: "05-31",
          },
          {
            season: "summer",
            modifier: 1.1,
            description: "Summer rates - AC and cooling system electrical work",
            startDate: "06-01",
            endDate: "08-31",
          },
          {
            season: "fall",
            modifier: 1.0,
            description: "Standard fall rates",
            startDate: "09-01",
            endDate: "11-30",
          },
        ],
        // Enhanced Features: Location Pricing
        locationPricing: {
          baseZone: "Metro Area",
          zones: [
            {
              name: "Local Service Area",
              zipCodes: ["12345", "12346", "12347", "12348"],
              cities: ["Downtown", "Midtown"],
              radius: 15,
              priceModifier: 1.0,
              minimumCharge: 150,
            },
            {
              name: "Metro Extended",
              zipCodes: ["12350", "12351", "12352"],
              cities: ["Suburbs", "Westside"],
              radius: 30,
              priceModifier: 1.15,
              minimumCharge: 200,
            },
            {
              name: "Regional Service",
              radius: 50,
              priceModifier: 1.3,
              minimumCharge: 300,
            },
          ],
          travelFeeStructure: [
            {
              distance: 15,
              fee: 0,
              description: "Free within 15 miles",
            },
            {
              distance: 30,
              fee: 25,
              description: "$25 for 15-30 miles",
            },
            {
              distance: 50,
              fee: 50,
              description: "$50 for 30-50 miles",
            },
          ],
        },
        variations: [
          {
            id: "outlet-installation",
            name: "Outlet Installation",
            description: "Adding new electrical outlets and switches",
            useCase: "Installing 4-6 new outlets with switches",
            estimatedValue: 650,
            items: [
              {
                description: "New Outlet Installation",
                unitPrice: 85,
                quantity: 4,
                unit: "outlet",
              },
              {
                description: "Switch Installation",
                unitPrice: 75,
                quantity: 2,
                unit: "switch",
              },
              {
                description: "Wire and Materials",
                unitPrice: 150,
                quantity: 1,
                unit: "allowance",
              },
            ],
          },
          {
            id: "panel-upgrade",
            name: "Electrical Panel Upgrade",
            description: "Complete electrical panel replacement and upgrade",
            useCase: "200 amp panel upgrade with new breakers",
            estimatedValue: 2200,
            items: [
              {
                description: "Panel Installation Labor",
                unitPrice: 95,
                quantity: 12,
                unit: "hour",
              },
              {
                description: "200 Amp Panel & Breakers",
                unitPrice: 850,
                quantity: 1,
                unit: "unit",
              },
              {
                description: "Permit & Inspection",
                unitPrice: 210,
                quantity: 1,
                unit: "fee",
              },
            ],
          },
          {
            id: "ceiling-fan-install",
            name: "Ceiling Fan Installation",
            description: "Professional ceiling fan installation service",
            useCase: "Installing 2-3 ceiling fans with new wiring",
            estimatedValue: 450,
            items: [
              {
                description: "Ceiling Fan Installation",
                unitPrice: 125,
                quantity: 2,
                unit: "fan",
              },
              {
                description: "Electrical Box Upgrade",
                unitPrice: 85,
                quantity: 2,
                unit: "box",
              },
              {
                description: "Wire and Materials",
                unitPrice: 75,
                quantity: 1,
                unit: "allowance",
              },
            ],
          },
          {
            id: "whole-house-rewire",
            name: "Whole House Rewiring",
            description: "Complete home electrical system rewiring",
            useCase: "Full rewiring of 1,500 sq ft home",
            estimatedValue: 8500,
            items: [
              {
                description: "Rewiring Labor",
                unitPrice: 95,
                quantity: 60,
                unit: "hour",
              },
              {
                description: "Electrical Materials",
                unitPrice: 2200,
                quantity: 1,
                unit: "allowance",
              },
              {
                description: "Permits & Inspections",
                unitPrice: 600,
                quantity: 1,
                unit: "fee",
              },
            ],
          },
        ],
        defaultTerms: {
          paymentTerms: "50% deposit required, 50% upon completion",
          cancellationPolicy:
            "Service can be cancelled with 24 hours notice. Emergency calls non-refundable.",
          warrantyInfo: "1 year warranty on all electrical work and materials",
          additionalTerms: [
            "Licensed electrician - License #EL12345",
            "$2M general liability insurance",
            "All work meets NEC and local electrical codes",
            "Emergency rates apply after hours and weekends",
            "Customer responsible for permits unless specified",
          ],
        },
        timeline: {
          estimatedDuration: "1-7 days depending on project scope",
          milestones: [
            {
              name: "Site Assessment",
              percentage: 25,
              description: "Initial evaluation and permit application",
            },
            {
              name: "Material Procurement",
              percentage: 50,
              description: "Order and receive electrical materials",
            },
            {
              name: "Installation",
              percentage: 75,
              description: "Complete electrical work",
            },
            {
              name: "Inspection & Testing",
              percentage: 100,
              description: "Final inspection and system testing",
            },
          ],
        },
        defaultNotes:
          "All work guaranteed for 1 year. Licensed and insured. Emergency rates apply after hours.",
        defaultTaxRate: 8.25,
      },
      {
        id: "plumber",
        name: "Plumber",
        category: "trade-construction",
        description: "For plumbing services and repairs",
        icon: "🔧",
        isPro: true,
        tags: ["licensed", "insured", "emergency", "residential", "commercial"],
        complexity: "standard",
        defaultItems: [
          {
            description: "Plumbing Service",
            unitPrice: 85,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Emergency Call Out",
            unitPrice: 150,
            quantity: 1,
            unit: "call",
          },
          {
            description: "Fixtures & Materials",
            unitPrice: 250,
            quantity: 1,
            unit: "allowance",
          },
          {
            description: "Drain Cleaning",
            unitPrice: 125,
            quantity: 1,
            unit: "service",
          },
        ],
        variations: [
          {
            id: "kitchen-sink-install",
            name: "Kitchen Sink Installation",
            description: "Complete kitchen sink and faucet installation",
            useCase: "Installing new kitchen sink with garbage disposal",
            estimatedValue: 450,
            items: [
              {
                description: "Sink Installation Labor",
                unitPrice: 85,
                quantity: 3,
                unit: "hour",
              },
              {
                description: "Faucet Installation",
                unitPrice: 120,
                quantity: 1,
                unit: "unit",
              },
              {
                description: "Plumbing Connections",
                unitPrice: 95,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "bathroom-renovation",
            name: "Bathroom Plumbing",
            description: "Complete bathroom plumbing renovation",
            useCase: "Full bathroom plumbing for toilet, sink, and shower",
            estimatedValue: 1800,
            items: [
              {
                description: "Bathroom Plumbing Labor",
                unitPrice: 85,
                quantity: 12,
                unit: "hour",
              },
              {
                description: "Fixtures & Materials",
                unitPrice: 650,
                quantity: 1,
                unit: "allowance",
              },
              {
                description: "Rough-in Plumbing",
                unitPrice: 350,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "water-heater-replacement",
            name: "Water Heater Replacement",
            description: "Complete water heater replacement service",
            useCase: "40-gallon gas water heater replacement",
            estimatedValue: 1200,
            items: [
              {
                description: "Water Heater Installation",
                unitPrice: 85,
                quantity: 4,
                unit: "hour",
              },
              {
                description: "40-Gallon Gas Water Heater",
                unitPrice: 650,
                quantity: 1,
                unit: "unit",
              },
              {
                description: "Gas Line Connection",
                unitPrice: 185,
                quantity: 1,
                unit: "service",
              },
            ],
          },
          {
            id: "sewer-line-repair",
            name: "Sewer Line Repair",
            description: "Main sewer line repair and replacement",
            useCase: "50 feet of sewer line replacement",
            estimatedValue: 3200,
            items: [
              {
                description: "Excavation & Labor",
                unitPrice: 85,
                quantity: 20,
                unit: "hour",
              },
              {
                description: "Sewer Pipe & Materials",
                unitPrice: 850,
                quantity: 1,
                unit: "allowance",
              },
              {
                description: "Permit & Inspection",
                unitPrice: 350,
                quantity: 1,
                unit: "fee",
              },
            ],
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Payment due upon completion. Emergency service requires immediate payment.",
          cancellationPolicy:
            "Service can be cancelled with 2 hours notice. Emergency calls non-refundable.",
          warrantyInfo: "90-day warranty on all plumbing work and fixtures",
          additionalTerms: [
            "Licensed plumber - License #PL67890",
            "$1M general liability insurance",
            "Minimum 2-hour charge on service calls",
            "Parts and materials at cost plus 20%",
            "24/7 emergency service available",
            "Customer responsible for access to work areas",
          ],
        },
        timeline: {
          estimatedDuration: "2 hours to 3 days depending on scope",
          milestones: [
            {
              name: "Assessment",
              percentage: 20,
              description: "Evaluate plumbing issue and provide estimate",
            },
            {
              name: "Material Procurement",
              percentage: 40,
              description: "Obtain necessary parts and materials",
            },
            {
              name: "Installation/Repair",
              percentage: 80,
              description: "Complete plumbing work",
            },
            {
              name: "Testing & Cleanup",
              percentage: 100,
              description: "Test system and clean work area",
            },
          ],
        },
        defaultNotes:
          "Minimum 2-hour charge. Parts and materials at cost plus 20%. 24/7 emergency service available.",
        defaultTaxRate: 8.25,
      },
      {
        id: "carpenter",
        name: "Carpenter",
        category: "trade-construction",
        description: "For carpentry and woodworking services",
        icon: "🪵",
        isPro: true,
        defaultItems: [
          {
            description: "Custom Carpentry Work",
            unitPrice: 75,
            quantity: 16,
            unit: "hour",
          },
          {
            description: "Material Costs",
            unitPrice: 800,
            quantity: 1,
            unit: "allowance",
          },
          {
            description: "Design & Planning",
            unitPrice: 85,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Finishing Work",
            unitPrice: 70,
            quantity: 8,
            unit: "hour",
          },
        ],
        defaultNotes:
          "Quality craftsmanship guaranteed. Wood selection and staining options available. Project timeline weather dependent.",
        defaultTaxRate: 8.25,
      },
      {
        id: "painter",
        name: "Painter",
        category: "trade-construction",
        description: "For interior and exterior painting",
        icon: "🎨",
        isPro: true,
        defaultItems: [
          {
            description: "Interior Painting",
            unitPrice: 3.5,
            quantity: 1000,
            unit: "sq ft",
          },
          {
            description: "Exterior Painting",
            unitPrice: 4.25,
            quantity: 800,
            unit: "sq ft",
          },
          {
            description: "Prep Work & Priming",
            unitPrice: 55,
            quantity: 12,
            unit: "hour",
          },
          {
            description: "Paint & Materials",
            unitPrice: 400,
            quantity: 1,
            unit: "allowance",
          },
        ],
        defaultNotes:
          "Premium paint included. 2-year warranty on workmanship. Color consultation available.",
        defaultTaxRate: 8.25,
      },
    ],
  },
  {
    id: "professional-services",
    name: "Professional Services",
    description: "Templates for licensed professionals",
    templates: [
      {
        id: "lawyer",
        name: "Lawyer",
        category: "professional-services",
        description: "For legal services and consultations",
        icon: "⚖️",
        isPro: true,
        tags: ["consultation", "hourly", "retainer", "court-representation"],
        complexity: "advanced",
        defaultItems: [
          {
            description: "Legal Consultation",
            unitPrice: 300,
            quantity: 2,
            unit: "hour",
          },
          {
            description: "Document Review",
            unitPrice: 250,
            quantity: 3,
            unit: "hour",
          },
          {
            description: "Court Representation",
            unitPrice: 350,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Legal Research",
            unitPrice: 200,
            quantity: 5,
            unit: "hour",
          },
        ],
        variations: [
          {
            id: "business-formation",
            name: "Business Formation Package",
            description: "Complete business entity formation and documentation",
            useCase:
              "New business formation, LLC/Corp setup, operating agreements",
            estimatedValue: 2500,
            items: [
              {
                description: "Business Formation Consultation",
                unitPrice: 300,
                quantity: 2,
                unit: "hour",
              },
              {
                description: "Entity Formation Filing",
                unitPrice: 800,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Operating Agreement/Bylaws",
                unitPrice: 1000,
                quantity: 1,
                unit: "document",
              },
              {
                description: "Tax ID & Business License Assistance",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
              {
                description: "Initial Compliance Setup",
                unitPrice: 200,
                quantity: 1,
                unit: "service",
              },
            ],
            notes:
              "Includes state filing fees. Additional licensing requirements may apply based on business type and location.",
          },
          {
            id: "contract-review",
            name: "Contract Review & Negotiation",
            description:
              "Professional contract analysis and negotiation services",
            useCase:
              "Employment contracts, vendor agreements, real estate contracts",
            estimatedValue: 1200,
            items: [
              {
                description: "Contract Analysis & Review",
                unitPrice: 250,
                quantity: 3,
                unit: "hour",
              },
              {
                description: "Risk Assessment Report",
                unitPrice: 200,
                quantity: 1,
                unit: "report",
              },
              {
                description: "Negotiation Strategy",
                unitPrice: 300,
                quantity: 1,
                unit: "hour",
              },
              {
                description: "Contract Revision & Redlining",
                unitPrice: 250,
                quantity: 2,
                unit: "hour",
              },
            ],
            notes:
              "Includes written risk assessment and recommended changes. Additional negotiation rounds billed at hourly rate.",
          },
          {
            id: "estate-planning",
            name: "Estate Planning Package",
            description: "Comprehensive estate planning documentation",
            useCase: "Wills, trusts, power of attorney, healthcare directives",
            estimatedValue: 1800,
            items: [
              {
                description: "Estate Planning Consultation",
                unitPrice: 300,
                quantity: 2,
                unit: "hour",
              },
              {
                description: "Will Preparation",
                unitPrice: 500,
                quantity: 1,
                unit: "document",
              },
              {
                description: "Power of Attorney Documents",
                unitPrice: 300,
                quantity: 1,
                unit: "set",
              },
              {
                description: "Healthcare Directive",
                unitPrice: 200,
                quantity: 1,
                unit: "document",
              },
              {
                description: "Trust Documentation (if applicable)",
                unitPrice: 500,
                quantity: 1,
                unit: "document",
              },
            ],
            notes:
              "Basic estate planning package. Complex trusts and tax planning may require additional fees.",
          },
          {
            id: "litigation-retainer",
            name: "Litigation Representation",
            description: "Court representation and litigation services",
            useCase: "Civil litigation, business disputes, contract disputes",
            estimatedValue: 10000,
            items: [
              {
                description: "Initial Case Assessment",
                unitPrice: 300,
                quantity: 3,
                unit: "hour",
              },
              {
                description: "Pleading Preparation",
                unitPrice: 250,
                quantity: 8,
                unit: "hour",
              },
              {
                description: "Discovery & Document Review",
                unitPrice: 200,
                quantity: 20,
                unit: "hour",
              },
              {
                description: "Court Appearances",
                unitPrice: 350,
                quantity: 12,
                unit: "hour",
              },
              {
                description: "Settlement Negotiations",
                unitPrice: 300,
                quantity: 6,
                unit: "hour",
              },
            ],
            notes:
              "$10,000 retainer required. Court costs, filing fees, and expert witnesses billed separately. Monthly billing against retainer.",
          },
        ],
        defaultTerms: {
          paymentTerms:
            "Retainer required for ongoing representation. Hourly services billed monthly with 30-day payment terms.",
          cancellationPolicy:
            "Client may terminate representation at any time. Unused retainer funds will be refunded minus costs incurred.",
          warrantyInfo:
            "Legal advice based on current law and facts provided. No guarantee of specific outcomes in legal matters.",
          additionalTerms: [
            "Attorney-client privilege protects all communications",
            "Court costs, filing fees, and third-party expenses billed separately",
            "Conflicts of interest checked before representation begins",
            "Client responsible for providing complete and accurate information",
            "Legal advice specific to jurisdiction and applicable law",
            "Representation agreement required before work begins",
          ],
        },
        timeline: {
          estimatedDuration:
            "Varies significantly based on matter complexity and court schedules",
          milestones: [
            {
              name: "Initial Consultation",
              percentage: 25,
              description: "Case assessment and strategy development",
            },
            {
              name: "Document Preparation",
              percentage: 50,
              description: "Legal research and document drafting",
            },
            {
              name: "Filing & Proceedings",
              percentage: 75,
              description: "Court filings and legal proceedings",
            },
            {
              name: "Resolution",
              percentage: 100,
              description: "Case conclusion and final documentation",
            },
          ],
        },
        defaultNotes:
          "Retainer required for ongoing representation. Court costs and filing fees billed separately.",
        defaultTaxRate: 0,
      },
      {
        id: "accountant",
        name: "Accountant",
        category: "professional-services",
        description: "For accounting and tax services",
        icon: "📊",
        isPro: true,
        defaultItems: [
          {
            description: "Tax Preparation - Individual",
            unitPrice: 200,
            quantity: 1,
            unit: "return",
          },
          {
            description: "Bookkeeping Services",
            unitPrice: 75,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Financial Statement Prep",
            unitPrice: 500,
            quantity: 1,
            unit: "statement",
          },
          {
            description: "Tax Planning Consultation",
            unitPrice: 150,
            quantity: 2,
            unit: "hour",
          },
        ],
        defaultNotes:
          "Tax season rates may apply. Additional forms and schedules charged separately. E-filing included.",
        defaultTaxRate: 0,
      },
      {
        id: "real-estate-agent",
        name: "Real Estate Agent",
        category: "professional-services",
        description: "For real estate services and commissions",
        icon: "🏠",
        isPro: true,
        defaultItems: [
          {
            description: "Real Estate Commission",
            unitPrice: 25000,
            quantity: 0.06,
            unit: "% of sale",
          },
          {
            description: "Marketing & Advertising",
            unitPrice: 500,
            quantity: 1,
            unit: "package",
          },
          {
            description: "Professional Photography",
            unitPrice: 300,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Staging Consultation",
            unitPrice: 200,
            quantity: 1,
            unit: "consultation",
          },
        ],
        defaultNotes:
          "Commission based on final sale price. Marketing costs included in commission. Professional service guarantee.",
        defaultTaxRate: 0,
      },
      {
        id: "insurance-agent",
        name: "Insurance Agent",
        category: "professional-services",
        description: "For insurance services and premiums",
        icon: "🛡️",
        isPro: true,
        defaultItems: [
          {
            description: "Insurance Premium",
            unitPrice: 1200,
            quantity: 1,
            unit: "year",
          },
          {
            description: "Policy Review",
            unitPrice: 0,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Claims Assistance",
            unitPrice: 0,
            quantity: 1,
            unit: "service",
          },
          {
            description: "Risk Assessment",
            unitPrice: 150,
            quantity: 1,
            unit: "assessment",
          },
        ],
        defaultNotes:
          "Annual premium with monthly payment options available. No charge for policy reviews and claims assistance.",
        defaultTaxRate: 0,
      },
      {
        id: "it-services",
        name: "IT Services",
        category: "professional-services",
        description: "For IT support and technology services",
        icon: "💻",
        isPro: true,
        defaultItems: [
          {
            description: "IT Support & Troubleshooting",
            unitPrice: 95,
            quantity: 4,
            unit: "hour",
          },
          {
            description: "Network Setup & Configuration",
            unitPrice: 125,
            quantity: 6,
            unit: "hour",
          },
          {
            description: "Software Installation",
            unitPrice: 85,
            quantity: 2,
            unit: "hour",
          },
          {
            description: "Monthly Maintenance Contract",
            unitPrice: 200,
            quantity: 1,
            unit: "month",
          },
        ],
        defaultNotes:
          "Remote support available. Hardware costs billed separately. 24/7 emergency support available.",
        defaultTaxRate: 8.25,
      },
    ],
  },
];

export const getTemplateById = (id: string): IndustryTemplate | undefined => {
  for (const category of INDUSTRY_TEMPLATES) {
    const template = category.templates.find((t) => t.id === id);
    if (template) return template;
  }
  return undefined;
};

export const getTemplatesByCategory = (
  categoryId: string
): IndustryTemplate[] => {
  const category = INDUSTRY_TEMPLATES.find((c) => c.id === categoryId);
  return category?.templates || [];
};

export const getAllTemplates = (): IndustryTemplate[] => {
  return INDUSTRY_TEMPLATES.flatMap((category) => category.templates);
};
