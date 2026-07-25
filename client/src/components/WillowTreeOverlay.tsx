import { motion } from "framer-motion";

const LEAF_GLOWS = [
  { left: "58%", top: "18%", size: 16, delay: 0 },
  { left: "52%", top: "30%", size: 13, delay: 0.6 },
  { left: "45%", top: "42%", size: 14, delay: 1.2 },
  { left: "38%", top: "56%", size: 12, delay: 1.8 },
  { left: "31%", top: "68%", size: 10, delay: 0.9 },
  { left: "24%", top: "78%", size: 11, delay: 1.5 },
];

export default function WillowTreeOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-[-10vw] top-[-2vh] z-[3] h-[72vh] w-[92vw] max-w-[920px] overflow-visible sm:right-[-8vw] sm:h-[84vh] sm:w-[78vw] lg:right-[-7vw] lg:h-[90vh] lg:w-[64vw]"
    >
      <motion.div
        className="absolute inset-0 origin-top-right"
        animate={{ rotate: [-1.4, 0.9, -1.1], y: [0, 6, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 1000 1200"
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="willow-trunk" x1="760" y1="80" x2="430" y2="1140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0C2A16" />
              <stop offset="0.35" stopColor="#103A1D" />
              <stop offset="0.72" stopColor="#1E6B32" />
              <stop offset="1" stopColor="#34FF7A" />
            </linearGradient>
            <linearGradient id="willow-leaf" x1="640" y1="120" x2="300" y2="980" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4DFF8A" stopOpacity="0.9" />
              <stop offset="1" stopColor="#99FFC2" stopOpacity="0.12" />
            </linearGradient>
            <filter id="willow-glow" x="-20%" y="-20%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.28 0 0 0 0 1 0 0 0 0 0.42 0 0 0 0.9 0"
              />
            </filter>
            <filter id="willow-soft" x="-20%" y="-20%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>

          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.8 }}
            filter="url(#willow-glow)"
          >
            <path
              d="M845 30C815 94 798 167 786 238C770 328 772 384 755 466C744 520 708 581 659 635C612 687 576 736 548 801C523 860 499 932 446 1030"
              stroke="#49FF8C"
              strokeOpacity="0.22"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M845 30C810 102 802 175 789 255C774 350 782 403 759 491C742 559 704 625 658 686C614 744 579 800 545 868C522 914 491 980 446 1085"
              stroke="url(#willow-trunk)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            <path d="M810 150C748 148 691 138 626 114" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M798 207C730 215 666 209 595 183" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M788 262C709 288 646 287 560 263" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M768 320C695 360 626 374 530 362" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M748 388C675 438 607 467 500 472" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M724 458C653 512 584 553 470 576" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />
            <path d="M694 527C626 592 553 642 431 684" stroke="url(#willow-leaf)" strokeWidth="4" strokeLinecap="round" />

            <path d="M760 110C728 128 684 174 644 247" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M770 174C744 190 706 240 676 315" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M766 244C743 266 712 323 691 402" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M750 314C728 338 698 398 682 473" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M725 382C705 418 676 482 661 559" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M697 455C673 493 640 569 618 660" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M662 528C637 572 605 656 578 762" stroke="#2C8B47" strokeWidth="3.5" strokeLinecap="round" />

            <path d="M642 150C611 177 584 220 560 270" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M608 214C578 245 553 291 526 349" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M578 289C544 326 514 381 490 440" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M540 368C507 414 482 470 462 537" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M498 448C466 498 442 560 426 634" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M456 526C429 582 408 648 392 720" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M414 602C389 659 371 722 357 792" stroke="#4BFF86" strokeWidth="2.4" strokeLinecap="round" />
          </motion.g>

          <motion.path
            d="M856 104C880 176 888 250 868 320C850 384 821 430 783 473C740 521 693 567 645 624C602 675 564 737 539 810"
            stroke="url(#willow-trunk)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="2 16"
            opacity="0.7"
            animate={{ opacity: [0.45, 0.78, 0.52], pathLength: [0.9, 1, 0.95] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <g filter="url(#willow-soft)">
            {LEAF_GLOWS.map((leaf) => (
              <motion.circle
                key={`${leaf.left}-${leaf.top}`}
                cx={leaf.left}
                cy={leaf.top}
                r={leaf.size}
                fill="#67FF8C"
                animate={{ opacity: [0.18, 0.92, 0.22], scale: [0.82, 1.1, 0.88] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: leaf.delay }}
              />
            ))}
          </g>
        </svg>
      </motion.div>
    </div>
  );
}
