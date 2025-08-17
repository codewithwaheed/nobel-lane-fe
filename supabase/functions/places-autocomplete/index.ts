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
    console.log("Received request:", req.method, req.url);
    console.log("Content-Type:", req.headers.get("content-type"));

    // Check if request has a body
    const text = await req.text();
    console.log("Request body:", text);

    if (!text || text.trim() === "") {
      console.log("Empty request body");
      return new Response(
        JSON.stringify({ error: "Request body is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestData;
    try {
      requestData = JSON.parse(text);
    } catch (parseError) {
      console.log("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { input, sessionToken, country = "us" } = requestData;

    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "'input' is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    console.log(
      "API Key available:",
      !!apiKey,
      apiKey ? `${apiKey.substring(0, 10)}...` : "none",
    );

    if (!apiKey) {
      console.log("Missing GOOGLE_MAPS_API_KEY environment variable");
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const params = new URLSearchParams({
      input,
      key: apiKey,
      components: `country:${country}`,
    });
    if (sessionToken) params.set("sessiontoken", sessionToken);

    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
    console.log(
      "Making request to Google API:",
      url.replace(apiKey, "API_KEY_HIDDEN"),
    );

    const res = await fetch(url);

    const data = await res.json();

    const response = {
      predictions: Array.isArray(data?.predictions) ? data.predictions : [],
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Error in places-autocomplete function:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
