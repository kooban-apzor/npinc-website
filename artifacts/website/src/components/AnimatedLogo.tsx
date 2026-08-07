import { motion, useReducedMotion } from "framer-motion";

const logoPng = "/npinc/logo.png";

const pathNP =
  "M 48 133 C 48 100, 46 55, 48 34 C 50 8, 82 10, 96 42 C 106 20, 132 6, 152 22 C 178 44, 172 86, 134 94 C 106 100, 90 80, 96 56 C 96 88, 96 112, 92 138";

const pathInfinity =
  "M 100 60 C 70 90, 40 105, 40 60 C 40 15, 70 30, 100 60 C 130 90, 160 105, 160 60 C 160 15, 130 30, 100 60 C 100 60, 100 60, 100 60";

const DURATION = 12;
const D_TIMES = [0, 5 / 12, 6 / 12, 11 / 12, 12 / 12];
const D_VALUES = [pathNP, pathNP, pathInfinity, pathInfinity, pathNP];
const OP_TIMES = [0, 5 / 12, 6 / 12, 11 / 12, 12 / 12];
const PNG_OPACITY = [1, 1, 0, 0, 1];
const VEC_OPACITY = [0, 0, 1, 1, 0];

interface AnimatedLogoProps {
  className?: string;
}

export function AnimatedLogo({ className }: AnimatedLogoProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={`aspect-square ${className ?? ""}`} role="img" aria-label="Nike Pillay Inc monogram" data-testid="img-logo-static">
        <img src={logoPng} alt="Nike Pillay Inc" className="w-full h-full object-contain" />
      </div>
    );
  }

  const transition = (times: number[]) => ({
    duration: DURATION,
    times,
    ease: "easeInOut" as const,
    repeat: Infinity,
  });

  return (
    <div
      className={`relative aspect-square ${className ?? ""}`}
      role="img"
      aria-label="Nike Pillay Inc monogram"
      data-testid="img-logo-animated"
    >
      <motion.img
        src={logoPng}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-contain"
        initial={{ opacity: 1 }}
        animate={{ opacity: PNG_OPACITY }}
        transition={transition(OP_TIMES)}
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: VEC_OPACITY }}
        transition={transition(OP_TIMES)}
      >
        <svg
          viewBox="34 9 132 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_0_18px_rgba(198,161,91,0.25)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="navbar-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8a6a2c" />
              <stop offset="30%" stopColor="#C6A15B" />
              <stop offset="50%" stopColor="#E8CB87" />
              <stop offset="70%" stopColor="#C6A15B" />
              <stop offset="100%" stopColor="#8a6a2c" />
            </linearGradient>
            <mask id="navbar-inner-line-mask">
              <rect x="-50" y="-50" width="300" height="300" fill="white" />
              <motion.path
                initial={{ d: pathNP }}
                animate={{ d: D_VALUES }}
                transition={transition(D_TIMES)}
                stroke="black"
                strokeWidth="4"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            </mask>
          </defs>
          <motion.path
            initial={{ d: pathNP }}
            animate={{ d: D_VALUES }}
            transition={transition(D_TIMES)}
            stroke="url(#navbar-gold-gradient)"
            strokeWidth="12"
            strokeLinecap="butt"
            strokeLinejoin="round"
            mask="url(#navbar-inner-line-mask)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
