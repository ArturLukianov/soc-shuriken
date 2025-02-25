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
      const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      const matches = input.match(emailRegex) || [];
      return { result: matches.join("\n") }
    }
};