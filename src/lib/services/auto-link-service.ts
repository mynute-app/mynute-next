type LinkTarget = {
  id: string | number;
};

type AutoLinkInput = {
  serviceId: string | number;
  branches: LinkTarget[];
  employees: LinkTarget[];
};

export type AutoLinkResult = {
  attempted: number;
  failed: number;
  skipped: boolean;
};

const linkWithPost = async (url: string) => {
  const response = await fetch(url, { method: "POST" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Auto link failed");
  }
};

export const autoLinkService = async ({
  serviceId,
  branches,
  employees,
}: AutoLinkInput): Promise<AutoLinkResult> => {
  if (!branches.length && !employees.length) {
    return { attempted: 0, failed: 0, skipped: true };
  }

  const tasks = [
    ...branches.map(branch =>
      linkWithPost(`/api/branch/${branch.id}/service/${serviceId}`)
    ),
    ...employees.map(employee =>
      linkWithPost(`/api/employee/${employee.id}/service/${serviceId}`)
    ),
  ];

  const results = await Promise.allSettled(tasks);
  const failed = results.filter(result => result.status === "rejected").length;

  return {
    attempted: results.length,
    failed,
    skipped: false,
  };
};
