export interface Hero {
  /** Small letter-spaced caps above the name. */
  eyebrow: string;
  name: string;
  subline: string;
}

export interface SubSection {
  id: string;
  title: string;
  blurb?: string;
  body: string;
}

export interface Section {
  id: 'about' | 'branding' | 'other';
  number: string;
  eyebrow: string;
  title: string;
  blurb?: string;
  body: string;
  subItems?: string[];
  subHeading?: string;
  subSections?: SubSection[];
  galleryHeading?: string;
  disclaimer?: string;
}

export interface Contact {
  line: string;
  linkedin: string;
  linkedinLabel: string;
}

export interface Footer {
  note: string;
}

export interface Site {
  title: string;
  hero: Hero;
  sections: Section[];
  contact: Contact;
  footer: Footer;
}

export const SITE: Site = {
  title: "Christina Moore — Creative Portfolio",

  hero: {
    eyebrow: "Creative portfolio",
    name: "Christina Moore",
    subline: "Branding, events, cakes, and other creative projects across the years.",
  },

  sections: [
    {
      id: "about",
      number: "01",
      eyebrow: "Section 01",
      title: "About Me",
      blurb:
        "Learn about my background and how artistic hobbies grew into a lasting creative passion",
      body:
        "From before I can remember, different creative outlets have always played an integral part in my life. Beginning in elementary school, painting mugs for Mother's Day, to my first pottery class in high school to my best friend's bachelorette trip and now home renovations for my parents' new house. While the type of artistic venture may have changed and transformed over time, my passion for creating has persisted, evolving to a way I have been able to differentiate myself in any professional roles. Beyond just as hobbies, I've learned over time that infusing a creative twist to my career leaves a lasting impression and brings character to a sometimes unimaginative corporate environment. Whether it was designing branded collateral for clients during a business workshop or making a cake to celebrate the launch of a new Salesforce CRM platform, small artistic touches leave a lasting impression. Over time, that instinct has stopped being just a hobby and become part of how I differentiate myself professionally, shaping the way I approach strategy and program management work. And with that, here are some of my favorite examples...",
    },
    {
      id: "branding",
      number: "03",
      eyebrow: "Section 03",
      title: "Branding / Event Planning",
      blurb:
        "How I've applied brand strategy and event curation to create meaningful personal experiences",
      body:
        "Drawing inspiration from my corporate event work and experiential marketing at brands I admire, I began translating that mindset into personalized experiences for meaningful gatherings with friends.",
      subItems: ["Galentine's Day", "Friendsgiving", "White Elephant"],
    },
    {
      id: "other",
      number: "04",
      eyebrow: "Section 04",
      title: "Other",
      blurb: "Additional examples of my creative work / ventures",
      subHeading: "Crafting, customized gifts and more",
      body:
        "What began as creative hobbies evolved into a way to design personalized gifts and custom pieces for my family and friends' milestones, exploring new artistic techniques along the way.",
      subSections: [
        {
          id: "cake",
          title: "Other Creative Work",
          blurb:
            "What began as creative hobbies evolved into a way to design personalized gifts and custom pieces for my family and friends' milestones, exploring new artistic techniques along the way.",
          body:
            "A previous entrepreneurial chapter that continues now as a creative pastime, shaping how I bring a personal, handmade touch to the people and milestones I care about.",
        },
      ],
      galleryHeading: "Graphic Design Portfolio",
      disclaimer:
        "All logos and trademarks shown belong to their respective owners. The work shown is personal, non-commercial, and created for portfolio purposes only. No affiliation or endorsement is implied.",
    },
  ],

  contact: {
    line: "Let's talk about a role, a project, or just to say hello.",
    linkedin: "https://www.linkedin.com/in/christina-moore-46120a13a",
    linkedinLabel: "Connect on LinkedIn",
  },

  footer: {
    note: "Designed and built by Christina Moore herself.",
  },
};
