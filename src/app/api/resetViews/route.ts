import { db } from "../../../util/db";
import { series } from "../../../util/schema";

export async function POST(request: Request) {

        await db
            .update(series)
            .set({ today_views: 0 }) // Set today_views to 0 for all series
            .execute();

            return new Response("OK");
        

}
