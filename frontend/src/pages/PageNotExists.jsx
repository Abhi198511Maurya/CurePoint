import React from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function PageNotExists({
  title = "Page not exists",
  description = "The page you're looking for may have been moved, deleted, or never existed.",
  href = "/",
}) {
  return (
    <div className="min-h-[60vh] w-full grid place-items-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xl rounded-2xl border bg-background/50 backdrop-blur-sm shadow-sm p-8 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium text-primary border-primary/30 bg-primary/10">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span>Not Found</span>
        </div>

        <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-primary">
          {title}
        </h1>

        <p className="mt-3 text-muted-foreground">{description}</p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to={href}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 transition"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </Link>
        </div>

        {/* Fine print */}
        <p className="mt-6 text-xs text-muted-foreground">
          If you believe this is a mistake, please check the URL or try again
          later.
        </p>
      </motion.div>
    </div>
  );
}
