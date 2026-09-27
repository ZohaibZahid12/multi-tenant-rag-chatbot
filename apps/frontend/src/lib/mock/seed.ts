import type { Conversation, KnowledgeDocument, Workspace } from "@/lib/api/types";

/** A searchable passage of a document — what the backend will store as an embedded chunk. */
export type Chunk = {
  documentId: string;
  page: number | null;
  text: string;
};

const daysAgo = (days: number, hours = 0) =>
  new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();

export const workspaces: Workspace[] = [
  { id: "ws_northwind", slug: "northwind", name: "Northwind Logistics" },
  { id: "ws_helio", slug: "helio", name: "Helio Clinic" },
];

function doc(
  partial: Pick<KnowledgeDocument, "id" | "workspaceId" | "name" | "sizeBytes" | "uploadedAt"> &
    Partial<KnowledgeDocument>,
): KnowledgeDocument {
  return {
    fileType: partial.name.split(".").pop() ?? "",
    status: "ready",
    progress: 100,
    chunkCount: 0,
    error: null,
    ...partial,
  };
}

export const documents: KnowledgeDocument[] = [
  doc({
    id: "doc_nw_safety",
    workspaceId: "ws_northwind",
    name: "Driver safety handbook.pdf",
    sizeBytes: 2_480_000,
    uploadedAt: daysAgo(21),
  }),
  doc({
    id: "doc_nw_returns",
    workspaceId: "ws_northwind",
    name: "Returns and refunds policy.md",
    sizeBytes: 14_200,
    uploadedAt: daysAgo(9),
  }),
  doc({
    id: "doc_nw_onboarding",
    workspaceId: "ws_northwind",
    name: "Warehouse onboarding.docx",
    sizeBytes: 318_000,
    uploadedAt: daysAgo(4),
  }),
  doc({
    id: "doc_nw_invoices",
    workspaceId: "ws_northwind",
    name: "Scanned invoice batch.pdf",
    sizeBytes: 9_870_000,
    uploadedAt: daysAgo(1, 3),
    status: "failed",
    progress: 0,
    error:
      "No text found. This looks like scanned images — export it as a searchable PDF and upload it again.",
  }),
  doc({
    id: "doc_nw_carriers",
    workspaceId: "ws_northwind",
    name: "Carrier contracts 2026.pdf",
    sizeBytes: 4_120_000,
    uploadedAt: daysAgo(0),
    status: "processing",
    progress: 35,
  }),
  doc({
    id: "doc_he_intake",
    workspaceId: "ws_helio",
    name: "Patient intake procedure.pdf",
    sizeBytes: 1_150_000,
    uploadedAt: daysAgo(30),
  }),
  doc({
    id: "doc_he_oncall",
    workspaceId: "ws_helio",
    name: "After-hours on-call rota.md",
    sizeBytes: 6_400,
    uploadedAt: daysAgo(12),
  }),
  doc({
    id: "doc_he_billing",
    workspaceId: "ws_helio",
    name: "Billing codes reference.txt",
    sizeBytes: 22_900,
    uploadedAt: daysAgo(6),
  }),
];

export const chunks: Chunk[] = [
  // Driver safety handbook
  {
    documentId: "doc_nw_safety",
    page: 3,
    text: "Drivers must complete a pre-trip inspection before every shift. The inspection covers tyres, lights, brakes, mirrors and load security, and is logged in the Fleet app before the vehicle leaves the yard.",
  },
  {
    documentId: "doc_nw_safety",
    page: 7,
    text: "Maximum driving time is 9 hours per day. Drivers must take a break of at least 45 minutes after 4.5 hours of continuous driving. The break can be split into 15 minutes followed by 30 minutes.",
  },
  {
    documentId: "doc_nw_safety",
    page: 12,
    text: "Any collision, however minor, must be reported to the shift supervisor within one hour. Photograph the scene and the other vehicle before moving, unless doing so is unsafe.",
  },
  {
    documentId: "doc_nw_safety",
    page: 15,
    text: "Mobile phones may only be used through the vehicle's hands-free system. Reading or sending messages while the engine is running is a dismissible offence.",
  },
  // Returns and refunds policy
  {
    documentId: "doc_nw_returns",
    page: null,
    text: "Customers can return undamaged goods within 30 days of delivery for a full refund. Items must be in their original packaging with the returns label attached.",
  },
  {
    documentId: "doc_nw_returns",
    page: null,
    text: "Refunds are issued to the original payment method within 5 business days of the return reaching the warehouse. Store credit is issued immediately if the customer prefers it.",
  },
  {
    documentId: "doc_nw_returns",
    page: null,
    text: "Damaged-in-transit claims must be raised within 48 hours of delivery with photos of the packaging. These are refunded in full and the cost is charged back to the carrier.",
  },
  {
    documentId: "doc_nw_returns",
    page: null,
    text: "Perishable, custom-made and hazardous goods cannot be returned unless they arrive damaged.",
  },
  // Warehouse onboarding
  {
    documentId: "doc_nw_onboarding",
    page: 1,
    text: "New starters spend their first two days shadowing a team lead on the picking floor before working a zone alone.",
  },
  {
    documentId: "doc_nw_onboarding",
    page: 2,
    text: "Safety boots and high-visibility vests are mandatory beyond the yellow line. Both are issued on day one and replaced free of charge when worn out.",
  },
  {
    documentId: "doc_nw_onboarding",
    page: 4,
    text: "Shifts run 06:00 to 14:00, 14:00 to 22:00 and 22:00 to 06:00. Shift swaps must be agreed with both team leads at least 48 hours in advance.",
  },
  // Patient intake procedure
  {
    documentId: "doc_he_intake",
    page: 2,
    text: "New patients complete the intake form online before their first visit. Reception verifies photo ID and the insurance card at check-in and scans both into the patient record.",
  },
  {
    documentId: "doc_he_intake",
    page: 3,
    text: "If a patient arrives more than 15 minutes late, reception offers the next available slot on the same day before rebooking.",
  },
  {
    documentId: "doc_he_intake",
    page: 5,
    text: "Patients under 16 must be accompanied by a parent or guardian, who signs the consent section of the intake form.",
  },
  // On-call rota
  {
    documentId: "doc_he_oncall",
    page: null,
    text: "Outside opening hours, calls are forwarded to the on-call clinician. The rota is published on the first Monday of each month.",
  },
  {
    documentId: "doc_he_oncall",
    page: null,
    text: "On-call clinicians must answer within 10 minutes. If there is no answer after two attempts, the call escalates to the clinical lead.",
  },
  // Billing codes
  {
    documentId: "doc_he_billing",
    page: null,
    text: "A standard consultation is billed under code GC-101. An extended consultation, over 30 minutes, is billed under GC-102.",
  },
  {
    documentId: "doc_he_billing",
    page: null,
    text: "Telehealth appointments use the same codes with the suffix -T, for example GC-101-T.",
  },
];

// Keep chunk counts consistent with the passages above.
for (const d of documents) {
  if (d.status === "ready") d.chunkCount = chunks.filter((c) => c.documentId === d.id).length;
}

export const conversations: Conversation[] = [
  {
    id: "conv_nw_breaks",
    workspaceId: "ws_northwind",
    title: "Driving time before a break",
    updatedAt: daysAgo(2),
    messages: [
      {
        id: "msg_nw_1",
        role: "user",
        content: "How long can a driver drive before they need a break?",
        citations: [],
        createdAt: daysAgo(2),
      },
      {
        id: "msg_nw_2",
        role: "assistant",
        content:
          "Drivers must take a break of at least 45 minutes after 4.5 hours of continuous driving [1]. The break can be split into 15 minutes followed by 30 minutes [1], and total driving time is capped at 9 hours per day [1].",
        citations: [
          {
            index: 1,
            documentId: "doc_nw_safety",
            documentName: "Driver safety handbook.pdf",
            page: 7,
            excerpt: chunks[1].text,
            quote:
              "Drivers must take a break of at least 45 minutes after 4.5 hours of continuous driving.",
          },
        ],
        createdAt: daysAgo(2),
      },
    ],
  },
  {
    id: "conv_he_id",
    workspaceId: "ws_helio",
    title: "ID needed at check-in",
    updatedAt: daysAgo(3),
    messages: [
      {
        id: "msg_he_1",
        role: "user",
        content: "What do new patients need to bring to their first appointment?",
        citations: [],
        createdAt: daysAgo(3),
      },
      {
        id: "msg_he_2",
        role: "assistant",
        content:
          "Reception verifies photo ID and the insurance card at check-in and scans both into the patient record [1]. The intake form itself is completed online before the first visit [1].",
        citations: [
          {
            index: 1,
            documentId: "doc_he_intake",
            documentName: "Patient intake procedure.pdf",
            page: 2,
            excerpt: chunks[11].text,
            quote:
              "Reception verifies photo ID and the insurance card at check-in and scans both into the patient record.",
          },
        ],
        createdAt: daysAgo(3),
      },
    ],
  },
];
