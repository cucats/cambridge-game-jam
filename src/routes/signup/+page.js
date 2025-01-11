import { redirect } from "@sveltejs/kit";

export function load() {
    redirect(
        302,
        "https://docs.google.com/forms/d/e/1FAIpQLSdg7wolqggBgM_koiI0FBM0Bd1QUuzkfmKuwtH1ugk2r2jKLA/viewform",
    );
}
