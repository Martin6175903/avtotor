export const demoSubmission = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 700);
    });
  }

  throw new Error('Demo submission: API is not connected.');
};
