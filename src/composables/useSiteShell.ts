import { mountSiteShell } from "@chankay/site-shell";
import { ref } from "vue";

type UseSiteShellOptions = {
  repoUrl: string;
  siteName: string;
};

export const useSiteShell = ({
  siteName,
  repoUrl,
}: UseSiteShellOptions) => {
  const shellHeaderTarget = ref<HTMLElement | null>(null);
  const shellFooterTarget = ref<HTMLElement | null>(null);

  const mountShellSections = () => {
    if (
      shellHeaderTarget.value &&
      shellHeaderTarget.value.childElementCount === 0
    ) {
      mountSiteShell({
        target: shellHeaderTarget.value,
        position: "header",
        siteName,
        repoUrl,
      });
    }

    if (
      shellFooterTarget.value &&
      shellFooterTarget.value.childElementCount === 0
    ) {
      mountSiteShell({
        target: shellFooterTarget.value,
        position: "footer",
      });
    }
  };

  return {
    mountShellSections,
    shellFooterTarget,
    shellHeaderTarget,
  };
};
