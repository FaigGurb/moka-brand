import { Site } from "@/components/Site";
import { DICTS } from "@/i18n/dict";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta("az", DICTS.az.meta.title, DICTS.az.meta.description);

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// First visit only (no language remembered yet): a browser that prefers English or Russian over
// Azerbaijani opens that version. Once any version has been opened, the choice is kept ('moka-lang').
const pickLang = `try{if(!localStorage.getItem("moka-lang")&&!/[?&]lang=/.test(location.search)){var l=navigator.languages||[navigator.language||""];for(var i=0;i<l.length;i++){var c=String(l[i]).slice(0,2).toLowerCase();if(c==="az"||c==="tr")break;if(c==="en"||c==="ru"){location.replace("${BASE}/"+c+"/"+location.hash);break}}}}catch(e){}`;

export default function Page() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: pickLang }} />
      <Site locale="az" />
    </>
  );
}
