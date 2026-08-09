export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-purple/10 via-primary-pink/5 to-transparent"></div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-pink/20 rounded-full blur-3xl
                      animate-float"></div>

      <div className="absolute top-40 right-20 w-96 h-96 bg-primary-purple/15 rounded-full blur-3xl
                      animate-float-delay"></div>

      <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-primary-pink/10 rounded-full blur-3xl
                      animate-float-delay-2"></div>

      <div className="absolute inset-0 bg-gradient-to-t from-neutral-white/50 dark:from-neutral-black/50 via-transparent to-transparent pointer-events-none"></div>
    </div>
  );
};
