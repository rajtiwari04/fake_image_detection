import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  ScanSearch,
  Lock,
  Database,
  ChevronRight,
  Sparkles,
  Fingerprint,
  Activity
} from "lucide-react";

const FEATURES = [
  {
    icon: ScanSearch,
    title: "Neural Detection",
    desc: "Advanced CNN architecture tuned to detect GAN artifacts.",
    color: "text-blue-400"
  },
  {
    icon: Activity,
    title: "Instant Inference",
    desc: "Authenticity scores delivered in under 1200ms.",
    color: "text-emerald-400"
  },
  {
    icon: Lock,
    title: "Secure Archives",
    desc: "Encrypted logs with full privacy.",
    color: "text-violet-400"
  },
  {
    icon: Database,
    title: "Signature Index",
    desc: "Growing deepfake pattern database."
  }
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#030711] to-[#020617] text-slate-200 overflow-x-hidden transform-gpu">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-8">

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>

          <span className="font-bold text-2xl text-white">
            Fake<span className="text-blue-400">Shield</span>
          </span>
        </div>

        <div className="flex gap-6 items-center">

          <Link
            to="/login"
            className="text-sm text-slate-400 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-5 py-2 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            Get Started
          </Link>

        </div>

      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">

        <div className="flex flex-col lg:flex-row items-center gap-16">

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex-1 text-center lg:text-left"
          >

            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/10 mb-6"
            >
              <Sparkles className="w-3 text-blue-400" />
              <span className="text-xs text-slate-400 uppercase">
                Next-Gen Image Forensics
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="text-6xl lg:text-7xl font-extrabold text-white leading-tight"
            >
              Verify the{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Unseen
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-lg text-slate-400 max-w-xl mt-6"
            >
              Deploy CNN-based analysis to detect deepfake imagery and protect digital truth.
            </motion.p>

            <motion.div
              variants={item}
              className="flex gap-4 mt-10 justify-center lg:justify-start"
            >

              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-blue-500 rounded-xl text-white hover:scale-105 transition"
              >
                Start Analyzing
                <ChevronRight />
              </Link>

              <Link
                to="/login"
                className="px-8 py-4 border border-white/20 rounded-xl text-slate-300 hover:bg-white/10 transition"
              >
                View Demo
              </Link>

            </motion.div>

          </motion.div>

          {/* VISUAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 relative"
          >

            <div className="relative rounded-3xl border border-white/10 bg-slate-900/40 p-10 text-center">

              <Fingerprint className="w-24 h-24 text-blue-400 mx-auto" />

              <p className="text-xs mt-4 text-blue-400 tracking-widest">
                SCANNING IMAGE SIGNATURE
              </p>

            </div>

          </motion.div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/10">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >

          <h2 className="text-4xl font-bold text-white">
            Engineered for <span className="text-blue-400">Precision</span>
          </h2>

          <p className="text-slate-400 mt-4">
            Pixel-level neural analysis detects manipulation invisible to humans.
          </p>

        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >

          {FEATURES.map(({ icon: Icon, title, desc, color }) => (

            <motion.div
              key={title}
              variants={item}
              whileHover={{ y: -6 }}
              className="rounded-2xl p-8 bg-slate-900/40 border border-white/10"
            >

              <Icon className={`w-8 h-8 mb-4 ${color}`} />

              <h3 className="text-xl font-semibold text-white mb-2">
                {title}
              </h3>

              <p className="text-sm text-slate-400">
                {desc}
              </p>

            </motion.div>

          ))}

        </motion.div>

      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-28">

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-16 bg-gradient-to-r from-blue-600 to-violet-600 text-center"
        >

          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to verify?
          </h2>

          <p className="text-blue-100 mb-10">
            Join thousands protecting digital authenticity.
          </p>

          <Link
            to="/register"
            className="px-10 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition"
          >
            Create Free Account
          </Link>

        </motion.div>

      </section>

    </div>
  );
}