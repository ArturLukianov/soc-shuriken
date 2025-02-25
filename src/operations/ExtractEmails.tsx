import { Operation } from "@/lib/types";

export const ExtractIPs: Operation = {
  name: "Extract IP Addresses",
  description: "Extract unique IPv4 addresses from text",
  category: "search",
  run: (input) => {
    const ipv4Regex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    const matches = input.match(ipv4Regex) || [];
    // Filter invalid IP addresses
    const valid = matches.filter((ip) => {
      const parts = ip.split(".");
      return parts.every(
        (part) => parseInt(part) >= 0 && parseInt(part) <= 255
      );
    });
    return {
      result: valid.join("\n")
    };
  },
};

export const ExtractEmails: Operation = {
    name: "Extract Emails",
    description: "Extract unique email addresses from text",
    category: "search",
    run: (input) => {
      const emailRegex = /[a-zA-Z0-9\.-_]+\@[a-zA-Z0-9\.-_]+\.[a-zA-Z]+/g;
      const matches = input.match(emailRegex) || [];
      return { result: matches.join("\n") }
    }
};