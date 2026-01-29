import { redirect } from "@sveltejs/kit";

export function load() {
  redirect(
    302,
    "https://forms.gle/q8XiMqeYFNZxYYbh8",
  );
}
