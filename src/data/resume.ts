/**
 * Every string the Experience section renders comes from this file and
 * nothing else. Copy is pasted from the master resume as supplied; no
 * value here is derived, rounded or invented. Clients are never named,
 * only described.
 */

export interface ResumeSectionMeta {
  id: "experience";
  number: string;
  eyebrow: string;
  title: string;
}

export type ViewId = "timeline" | "skills" | "overview";

export interface ResumeView {
  id: ViewId;
  label: string;
  /** URL hash that selects this view, without the leading #. */
  hash: string;
}

export interface Role {
  employer: string;
  title: string;
  /** Rendered verbatim, e.g. "2021 to Present". */
  dates: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  school: string;
  dates: string;
  degree: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Resume {
  section: ResumeSectionMeta;
  views: ResumeView[];
  summary: string;
  roles: Role[];
  education: Education;
  stats: Stat[];
  /** Skills as supplied, in two unlabelled groups. No levels. */
  skillGroups: string[][];
}

export const RESUME: Resume = {
  section: {
    id: "experience",
    number: "02",
    eyebrow: "Section 02",
    title: "Experience",
  },

  views: [
    { id: "timeline", label: "Timeline", hash: "experience" },
    { id: "skills", label: "Skills", hash: "experience-skills" },
    { id: "overview", label: "Overview", hash: "experience-overview" },
  ],

  summary:
    "Event, strategy and program manager with over five years at Ernst & Young leading end-to-end delivery for a range of audiences. Owns responsibilities across strategic planning, content design / curation, vendor and budget management, on-site execution and post-event analysis. Hosts and manages programs for clients spanning industries and with enterprises valued up to $3B. Skilled at managing the full event lifecycle, organizing complex logistics, developing tailored programming, and aligning cross-functional support teams. Experience enabling AI tools to accelerate performance across all responsibilities.",

  roles: [
    {
      employer: "Ernst & Young (EY Studio+)",
      title: "Strategy Consulting Manager",
      dates: "2021 to Present",
      bullets: [
        "Led a 3-year, $8.5M Salesforce CRM transformation for a $1.7B Ad Sales organization, serving as central liaison across 250+ resources and 20+ functional workstreams, with a phased release to over 3,000 end users and bi-weekly PMO status reporting to senior leadership",
        "Influenced $380M in revenue, enabling multi-million-dollar cost savings through deprecation of three legacy platforms",
        "Rebuilt a stalled post-merger Salesforce CRM program for a $20M edtech company as sole program lead, returning it to target timeline within 3 months, and coordinated the design of 40+ future-state order-to-cash process flows",
        "Advised SVP+ executives at a $3B agribusiness on a technology-platform assessment that informed a multimillion-dollar CRM selection decision, and led a team defining 1,500+ future-state requirements for the billing platform redesign",
        "Coordinated a 2,500+ person learning event: execution strategy, programming content, day-of logistics and KPI metrics; developed an event operations playbook for 50 teammates",
        "Designed an AI workflow converting process flows into system requirements, cutting a delivery team's size in half, and automated biweekly executive status reporting, saving 4 resource hours per week",
      ],
    },
    {
      employer: "University of Maryland Student Entertainment Events",
      title: "Lectures Director",
      dates: "2018 to 2020",
      bullets: [
        "Managed a $100K talent and execution budget and contract negotiations with global agencies including WME and UTA",
        "Directed marketing and logistics for 30K+ attendees annually, delivering 4 sold-out events of 800+ attendees each",
      ],
    },
    {
      employer: "Connecticut Innovations",
      title: "Marketing & Events Coordinator",
      dates: "2017 to 2019",
      bullets: [
        "Led vendor sourcing and contract negotiation for 8+ events and managed a $75K execution budget and all onsite logistics",
        "Designed event collateral including invites, signage and experiential materials for a $5M global startup competition",
      ],
    },
  ],

  education: {
    institution: "University of Maryland",
    school: "Robert H. Smith School of Business",
    dates: "2016 to 2020",
    degree: "Bachelor of Science in Finance and Marketing",
  },

  stats: [
    { value: "$8.5M", label: "CRM program led" },
    { value: "250+", label: "resources coordinated" },
    { value: "3,000+", label: "end users reached" },
    { value: "$380M", label: "revenue influenced" },
  ],

  skillGroups: [
    [
      "Event strategy and execution",
      "Program management",
      "Salesforce CRM transformation",
      "Governance and status reporting",
    ],
    [
      "Process design",
      "AI workflow design (Claude, Microsoft Copilot, ChatGPT)",
      "Stakeholder management, SVP+",
    ],
  ],
};
