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
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Updated series table with publishers as array
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
  publisher: text("publisher").array().notNull(), // Changed to array
  total_views: integer("total_views").notNull().default(0),
  today_views: integer("today_views").notNull().default(0),
  last_update: timestamp("last_update", { withTimezone: true }),
  url_code: text("url_code"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Remove the unique constraint that included publisher since it's now an array
  titleIdx: index("title_idx").on(table.title),
  urlIdx: index("url_idx").on(table.url),
}));

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
export const seriesRelations = relations(series, ({ many }) => ({
  chapters: many(chapters),
  ratings: many(ratings),
  bookmarks: many(bookmarks),
  messages: many(seriesMessages),
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