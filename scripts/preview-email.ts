import { render } from "@react-email/render";
import { UpdateEmail } from "../emails/UpdateEmail";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  console.log("Generating Update Email preview for July 18, 2026 at", time);
  
  const html = await render(UpdateEmail({ time }));
  
  const previewPath = path.join(__dirname, "../emails/preview.html");
  fs.writeFileSync(previewPath, html);
  
  console.log("Email rendered and written to", previewPath);
}

main().catch((err) => {
  console.error(err);
});
