import { addonBuilder, Manifest, Stream } from "stremio-addon-sdk";
import { getStreamContent, VixCloudStreamInfo } from "./extractor";

const manifest: Manifest = {
    id: "org.stremio.vixsrc",
    version: "0.1.0",
    name: "StreamViX",
    description: "Addon for Vixsrc streams.", 
    icon: "icon.png",
    background: "/public/backround.png", // Aggiungi /public/ qui
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: [],
    // Usa la forma abbreviata per le risorse
    resources: ["stream"] 
};

const builder = new addonBuilder(manifest);


builder.defineStreamHandler(
  async ({
    id,
    type,
  }): Promise<{
    streams: Stream[];
  }> => {
    try {
      const res: VixCloudStreamInfo[] | null = await getStreamContent(id, type);

      if (!res) {
        return { streams: [] };
      }

      let streams: Stream[] = [];
      for (const st of res) {
        if (st.streamUrl == null) continue;
        streams.push({
          title: st.name,
          url: st.streamUrl,
          // behaviorHints: { notWebReady: true } // Retain if m3u8 might not be web-ready
          behaviorHints: {
            notWebReady: true,
          },
          proxyHeaders: { "request": { "Referer": st.referer } }
        } as Stream); // Explicitly cast to Stream
      }
      return { streams: streams };
    } catch (error) {
      console.error('Stream extraction failed:', error);
      return { streams: [] };
    }
  }
);

export const addon = builder;
export default builder.getInterface();
