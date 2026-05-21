import { banCommand } from "./ban";
import { kickCommand } from "./kick";
import { muteCommand } from "./mute";
import { unmuteCommand } from "./unmute";
import { warnCommand } from "./warn";
import { warningsCommand } from "./warnings";
import { clearCommand } from "./clear";
import { setupVerificationCommand } from "./setupVerification";
import { setupWelcomeCommand } from "./setupWelcome";
import { setupTicketsCommand } from "./setupTickets";
import { inviteTopCommand } from "./inviteTop";

export function getCommands() {
  return [
    banCommand,
    kickCommand,
    muteCommand,
    unmuteCommand,
    warnCommand,
    warningsCommand,
    clearCommand,
    setupVerificationCommand,
    setupWelcomeCommand,
    setupTicketsCommand,
    inviteTopCommand,
  ];
}
