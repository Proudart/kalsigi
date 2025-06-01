import {
  pgTable,
  text,
  integer,
  bigserial,
  timestamp,
  uuid,
  json,
  boolean,
  jsonb,
  primaryKey,
  numeric,
  index,
  serial,
  varchar,
  bigint,
  decimal,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Updated series table with submitted_by field
export const series = pgTable("series", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  url: text("url"),
  alternative_titles: jsonb("alternative_titles"),
  description: text("description"),
  total_chapters: integer("total_chapters"),
  cover_image_url: text("cover_image_url"),
  author: text("author"),
  artist: text("artist"),
  genre: text("genres").array(),
  type: text("type").array(),
  release_date: timestamp("release_date", { withTimezone: true }),
  status: text("status"),
  publisher: text("publisher").array().notNull(),
  submitted_by: uuid("submitted_by").references(() => scanlationGroups.id), // Can be null
  total_views: integer("total_views").notNull().default(0),
  today_views: integer("today_views").notNull().default(0),
  last_update: timestamp("last_update", { withTimezone: true }),
  url_code: text("url_code"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("title_idx").on(table.title),
  urlIdx: index("url_idx").on(table.url),
  submittedByIdx: index("submitted_by_idx").on(table.submitted_by),
}));

// New table for series submissions by scanlation groups
export const seriesSubmissions = pgTable("series_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  alternative_titles: text("alternative_titles"), // Stored as comma-separated or JSON string
  description: text("description"),
  status: text("status"), // ongoing, completed, hiatus, cancelled, etc.
  type: text("type"), // manga, manhwa, manhua, novel, etc.
  genres: text("genres"), // Stored as comma-separated string
  author: text("author"),
  artist: text("artist"),
  release_year: text("release_year"),
  source_url: text("source_url"), // Original source URL
  cover_image_url: text("cover_image_url"),
  group_id: uuid("group_id").notNull().references(() => scanlationGroups.id, { onDelete: "cascade" }),
  submitted_by_user: text("submitted_by_user").notNull(), // User ID who submitted
  submission_status: varchar("submission_status", { length: 20 }).default("pending"), // pending, approved, rejected
  rejection_reason: text("rejection_reason"),
  approved_by: text("approved_by"), // Admin/moderator who approved
  approved_series_id: uuid("approved_series_id").references(() => series.id), // Link to created series if approved
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index("group_id_idx").on(table.group_id),
  submissionStatusIdx: index("submission_status_idx").on(table.submission_status),
  titleIdx: index("submission_title_idx").on(table.title),
}));

export const chapterSubmissions = pgTable('chapter_submissions', {
  // Primary key
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Foreign keys
  series_id: uuid('series_id').notNull().references(() => series.id),
  group_id: text('group_id').notNull().references(() => scanlationGroups.id),
  submitted_by_user: uuid('submitted_by_user').references(() => user.id), // nullable for now
  
  // Chapter information
  chapter_number: varchar('chapter_number', { length: 50 }).notNull(), // e.g., "1", "1.5", "001"
  chapter_title: varchar('chapter_title', { length: 255 }), // optional chapter title
  
  // Content
  release_notes: text('release_notes'), // translator/group notes
  page_count: integer('page_count').notNull(),
  page_urls: jsonb('page_urls').notNull(), // JSON array of chapter page URLs
  start_image_url: varchar('start_image_url', { length: 500 }), // optional branding/intro image
  end_image_url: varchar('end_image_url', { length: 500 }), // optional credits/outro image
  
  // Submission status
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
  
  // Review information
  review_notes: text('review_notes'), // admin feedback/rejection reason
  approved_chapter_id: uuid('approved_chapter_id').references(() => chapters.id), // links to published chapter if approved
  
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});



// Updated chapters table - keep publisher as text since individual chapters come from specific publishers
export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),
  series_id: uuid("series_id").references(() => series.id, { onDelete: "cascade" }).notNull(),
  chapter_number: numeric("chapter_number", { precision: 10, scale: 2 }).notNull(),
  title: text("title"),
  content: jsonb("content").notNull(),
  views: integer("views").notNull().default(0),
  publisher: text("publisher").notNull(), // Keep as text for individual chapters
  striked: boolean("is_deleted").notNull().default(false), // Added striked field
  published_at: timestamp("published_at", { withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  chapterSeriesUnique: primaryKey(table.series_id, table.chapter_number),
  seriesChapterIdx: index("series_chapter_idx").on(table.series_id, table.chapter_number),
}));

// Updated relationships
export const seriesRelations = relations(series, ({ many, one }) => ({
  chapters: many(chapters),
  ratings: many(ratings),
  bookmarks: many(bookmarks),
  messages: many(seriesMessages),
  submittedBy: one(scanlationGroups, {
    fields: [series.submitted_by],
    references: [scanlationGroups.id],
  }),
}));

export const seriesSubmissionsRelations = relations(seriesSubmissions, ({ one }) => ({
  group: one(scanlationGroups, {
    fields: [seriesSubmissions.group_id],
    references: [scanlationGroups.id],
  }),
  approvedSeries: one(series, {
    fields: [seriesSubmissions.approved_series_id],
    references: [series.id],
  }),
}));

// Keep existing tables with updated references to new series table
export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  series_url: text("series_url").references(() => series.url),
  rating: integer("rating"),
  user_id: text("user_id"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
  series: one(series, {
    fields: [ratings.series_url],
    references: [series.url],
  }),
}));

export const bookmarks = pgTable("bookmarks", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  seriesId: uuid("series_id").references(() => series.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(user, {
    fields: [bookmarks.userId],
    references: [user.id],
  }),
  series: one(series, {
    fields: [bookmarks.seriesId],
    references: [series.id],
  }),
}));

export const seriesHistory = pgTable("seriesHistory", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id)
    .unique(),
  history: text("history").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Updated messages tables to reference new series/chapters tables
export const chapterMessages = pgTable("chaptermessages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chapterId: uuid("chapter_id").references(() => chapters.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  parentId: uuid("parent_id").references(() => chapterMessages.id, { onDelete: "set null" }),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
}) as any;

export const seriesMessages = pgTable("seriesmessages", {
  id: uuid("id").primaryKey().defaultRandom(),
  seriesId: uuid("series_id").references(() => series.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  parentId: uuid("parent_id").references(() => seriesMessages.id, { onDelete: "set null" }),
  likes: integer("likes").default(0),
  dislikes: integer("dislikes").default(0),
}) as any;

// Messages relations
export const chapterMessagesRelations = relations(chapterMessages, ({ one }) => ({
  chapter: one(chapters, {
    fields: [chapterMessages.chapterId],
    references: [chapters.id],
  }),
  user: one(user, {
    fields: [chapterMessages.userId],
    references: [user.id],
  }),
  parent: one(chapterMessages, {
    fields: [chapterMessages.parentId],
    references: [chapterMessages.id],
  }),
}));

export const seriesMessagesRelations = relations(seriesMessages, ({ one }) => ({
  series: one(series, {
    fields: [seriesMessages.seriesId],
    references: [series.id],
  }),
  user: one(user, {
    fields: [seriesMessages.userId],
    references: [user.id],
  }),
  parent: one(seriesMessages, {
    fields: [seriesMessages.parentId],
    references: [seriesMessages.id],
  }),
}));

// User interactions tables
export const userChapterMessageInteractions = pgTable("userchaptermessageinteractions", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  messageId: uuid("message_id").notNull().references(() => chapterMessages.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.messageId),
}));

export const userSeriesMessageInteractions = pgTable("usermseriesessageinteractions", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  messageId: uuid("message_id").notNull().references(() => seriesMessages.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(),
}, (table) => ({
  pk: primaryKey(table.userId, table.messageId),
}));

export const premiumUsers = pgTable("premiumusers", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id")
    .references(() => user.id)
    .notNull(),
  isRecurring: boolean("is_recurring").notNull(),
  startDate: timestamp("start_date").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
});

export const consult = pgTable("consult", {
  id: bigserial("id", { mode: "number" }),
  time: text("time"),
  url: text("url"),
  type: text("type"),
  email: text("email"),
  summary: text("summary"),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('reader'), // user, admin, moderator
  emailVerified: boolean('email_verified').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(()=> user.id)
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(()=> user.id),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at')
});

export const chapterSummaries = pgTable("chapter_summaries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  chapter: numeric("chapter", { precision: 10, scale: 2 }).notNull(),
  tldr: text("tldr"),
  synopsis: text("synopsis"),
  keywords: jsonb("keywords"),    
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
  titleChapterIdx: index("title_chapter_idx").on(table.title, table.chapter),
}));

// Update the chapters relation to handle type conversion
export const chaptersRelations = relations(chapters, ({ one }) => ({
  series: one(series, {
    fields: [chapters.series_id],
    references: [series.id],
  }),
  summary: one(chapterSummaries, {
    fields: [chapters.title, chapters.chapter_number],
    references: [chapterSummaries.title, chapterSummaries.chapter],
  }),
}));

// Update chapter summaries relations
export const chapterSummariesRelations = relations(chapterSummaries, ({ one }) => ({
  chapter: one(chapters, {
    fields: [chapterSummaries.title, chapterSummaries.chapter],
    references: [chapters.title, chapters.chapter_number],
  }),
}));

export const scanlationGroups = pgTable('scanlation_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  discordUrl: text('discord_url'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, suspended
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => scanlationGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  role: varchar('role', { length: 20 }).notNull(), // owner, co-owner, moderator, qa, uploader, member
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  invitedBy: uuid('invited_by'),
  status: varchar('status', { length: 20 }).default('active'), // active, pending, suspended
});

// Group Invitations Table
export const groupInvitations = pgTable('group_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => scanlationGroups.id, { onDelete: 'cascade' }),
  invitedBy: uuid('invited_by').notNull(),
  email: varchar('email', { length: 255 }),
  userId: uuid('user_id'), // if inviting existing user
  role: varchar('role', { length: 20 }).notNull(),
  token: varchar('token', { length: 255 }).unique(),
  expiresAt: timestamp('expires_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, accepted, expired, declined
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Group Revenue Table (for future use)
export const groupRevenue = pgTable('group_revenue', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => scanlationGroups.id),
  monthYear: varchar('month_year', { length: 7 }), // "2025-01"
  pageViews: bigint('page_views', { mode: 'number' }).default(0),
  adRevenue: decimal('ad_revenue', { precision: 10, scale: 2 }).default('0'),
  subscriptionRevenue: decimal('subscription_revenue', { precision: 10, scale: 2 }).default('0'),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  calculatedAt: timestamp('calculated_at').defaultNow().notNull(),
});

// Relations
export const scanlationGroupsRelations = relations(scanlationGroups, ({ many }) => ({
  members: many(groupMembers),
  invitations: many(groupInvitations),
  revenue: many(groupRevenue),
  submittedSeries: many(series), // Series submitted by this group
  seriesSubmissions: many(seriesSubmissions), // Pending submissions by this group
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(scanlationGroups, {
    fields: [groupMembers.groupId],
    references: [scanlationGroups.id],
  }),
}));

export const groupInvitationsRelations = relations(groupInvitations, ({ one }) => ({
  group: one(scanlationGroups, {
    fields: [groupInvitations.groupId],
    references: [scanlationGroups.id],
  }),
}));