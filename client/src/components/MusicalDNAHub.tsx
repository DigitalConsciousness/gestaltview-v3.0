import { ArrowRight, Disc3 } from "lucide-react";
import { Link } from "wouter";

export default function MusicalDNAHub() {
  return (
    <Link href="/musical-dna">
      <a className="group block rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-5 transition-transform duration-300 hover:-translate-y-0.5 hover:border-gv-aurora-cyan/25">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gv-aurora-cyan/20 bg-gv-aurora-cyan/10 text-gv-aurora-cyan">
              <Disc3 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-semibold text-gv-text-primary">Musical DNA</p>
              <p className="mt-1 text-sm leading-relaxed text-gv-text-secondary">
                Your musical self has its own room. It has been waiting.
              </p>
            </div>
          </div>
          <ArrowRight className="mt-2 h-5 w-5 text-gv-text-muted transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gv-text-muted">
          Go there
        </div>
      </a>
    </Link>
  );
}
