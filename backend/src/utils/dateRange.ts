const getDateRange = (days: number): { since: string, until: string } => {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const until = new Date();
    return { since: since.toISOString(), until: until.toISOString() };
};

export default getDateRange;