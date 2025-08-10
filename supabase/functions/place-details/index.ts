// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { placeId } = await req.json();
    if (!placeId || typeof placeId !== "string") {
      return new Response(JSON.stringify({ error: "'placeId' is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      fields: "formatted_address,geometry/location,address_components",
    });

    const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();

    return new Response(JSON.stringify({ result: data?.result ?? {} }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
