import { Operation } from "@/lib/types";

export const ExtractEmails: Operation = {
    name: "Extract Emails",
    description: "Extract unique email addresses from text",
    category: "extract",
    run: (input) => {
      const emailRegex = /[\w.+-]+@(?:[\w-]+\.)+[a-zA-Z]{2,}/g;
      const matches = input.match(emailRegex) || [];
      return { result: matches.join("\n") }
    }
};
