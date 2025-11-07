const config = {
  providers: [
    {
      // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        (() => {
          throw new Error(
            "CLERK_JWT_ISSUER_DOMAIN environment variable is required"
          );
        })(),
      applicationID: "convex",
    },
  ],
};

export default config;
