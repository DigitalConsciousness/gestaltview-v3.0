// InsightWindow.tsx
// GestaltView Musical DNA — Insight Window Component
// © 2026 Keith Soyka / GestaltView — All Rights Reserved

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type SomaticMode = "bilateral" | "trilateral" | "quadlateral";
type InsightTab = "why" | "what" | "how";

interface SongInsight {
  id: string;
  title: string;
  artist: string;
  archetype: string;
  emotionalCluster: string;
  why: string;
  what: string;
  how: { bilateral: string; trilateral: string; quadlateral: string };
  modeGuidance: string;
}

interface InsightWindowProps {
  song: SongInsight;
  activeMode: SomaticMode;
  onClose: () => void;
  isOpen: boolean;
}

// ─── Song Data ───────────────────────────────────────────────────────────────

export const MUSICAL_DNA_SONGS: SongInsight[] = [
  {
    id: "nutshell-aic",
    title: "Nutshell",
    artist: "Alice in Chains",
    archetype: "The Survivor Witness",
    emotionalCluster: "Introspection & Radical Honesty",
    why: `Layne Staley wrote Nutshell in 1994, the same year his addiction had consumed nearly everything. What makes this song extraordinary is what he chose to do with that pain. He did not hide it. He did not perform strength he did not have. He witnessed himself, clearly and without flinching, and put it into four minutes of acoustic truth.\n\n"We chase misprinted lies / We face the path of time" — that is not poetry for its own sake. That is someone holding up a mirror to the cost of living inside a mind that would not quiet down.\n\nLayne died in 2002. He had been alone in his apartment for two weeks before anyone found him. This song is what he left: proof that he saw himself fully, even when no one else could. That act of self-witnessing — refusing to look away from your own reality — is the founding axiom of everything GestaltView is built on.\n\nIf this song is finding you right now, something in you already knows what it means to carry more than you have been given language for.`,
    what: `Right now, if you are listening with Bi-Lateral mode active, your brain is being gently guided through bilateral stimulation — the same neurological mechanism at the core of EMDR therapy (Shapiro, 1989).\n\nSound alternating left to right creates a rhythmic activation of both brain hemispheres. Your auditory cortex, then your prefrontal cortex, begins integrating fragmented emotional memory — the kind that lives in the body as tightness or heaviness rather than clear thought.\n\nLayne's voice operates at approximately 200–400Hz — the frequency range associated with emotional resonance and vocal intimacy. The acoustic guitar sits at 80–250Hz, overlapping with the bass frequencies your nervous system uses to determine: am I safe?\n\nThe answer this song gives your nervous system is not "everything is fine." It is something more honest and more useful: someone else has been here. You are not alone in this. That recognition activates the vagus nerve's social engagement system (Porges, 2011). Your heart rate steadies. Your breath deepens. Not because the pain is gone. Because you are not carrying it alone.`,
    how: {
      bilateral: `Bi-Lateral is the processing mode. It is asking your brain's two hemispheres to talk to each other — to integrate something that may have been stored in fragments.\n\nClose your eyes if it feels safe. Let the sound move left to right. You do not need to do anything with whatever comes up. Just let it surface. That is the work. Layne did not resolve anything in this song — he witnessed it. You are allowed to do the same.`,
      trilateral: `Tri-Lateral adds vertical depth — sound moving through three spatial points around your skull. This activates your vestibular system alongside your auditory cortex.\n\nWith Nutshell, this mode amplifies the sense of being held in three-dimensional space. If bilateral felt too flat, or if your nervous system needs more spatial input to feel grounded, this is your mode. Let the sound surround rather than cross.`,
      quadlateral: `The Figure-8 is the regulation mode. If you opened this song because you are already overwhelmed — if just seeing the title made something tighten in your chest — start here.\n\nThe continuous figure-8 pattern gives your nervous system something predictable to track. Like a weighted blanket in sound form. You are not being asked to process anything. You are being held. Let the sound move in its loop. Breathe. Come back when you are ready.`,
    },
    modeGuidance: `Trying to understand something → Bi-Lateral\nNeed to feel held in space → Tri-Lateral\nAlready at your edge → Figure-8 first`,
  },
  {
    id: "3libras-apc",
    title: "3 Libras",
    artist: "A Perfect Circle",
    archetype: "The Unseen One",
    emotionalCluster: "Connection & The Wound of Invisibility",
    why: `Maynard James Keenan wrote 3 Libras about the particular devastation of being in the same room as someone — fully present, fully open — and watching them look right through you.\n\n"Threw you the obvious / just to see if there's more behind the eyes of a fallen angel" — he is reaching. He is offering something true. And the person he is offering it to cannot receive it. Cannot see it. Cannot see him.\n\nThis is one of the most specific wounds there is, and it is almost never named. Not abandonment. Not rejection. Invisibility. The experience of being present and unwitnessed.\n\nFor anyone who grew up neurodivergent, for anyone who moved through the world knowing they were different without having language for why, for anyone who has sat across from someone they loved and felt utterly alone — this song is often the first time that experience is reflected back.\n\nMaynard's falsetto carries a specific quality here: it does not perform strength. It exposes need. Exposure without shame is one of the hardest things a human being can do. He does it for four minutes and calls it a gift.`,
    what: `3 Libras sits in a precise neurological space. Maynard's falsetto operates above 1kHz, into the range associated with emotional acuity and heightened sensitivity. The strings beneath him sit at 250–500Hz, the range most associated with warmth, safety, and human presence.\n\nThe effect: your brain simultaneously receives a signal of emotional vulnerability (high frequencies) within a container of safety (mid-range warmth). This is technically what co-regulation feels like — being emotionally activated while remaining physiologically safe.\n\nFor those with heightened nervous system sensitivity — ADHD, HSP, or anyone whose neuroception has been tuned by experience to scan for threat — this song can produce an unusual response: tears without understanding why.\n\nThat response is not weakness. It is recognition. Your nervous system identifying, possibly for the first time, that it has been carrying the weight of being unseen for a very long time. The tears are the weight setting down.`,
    how: {
      bilateral: `Bi-Lateral with 3 Libras is an act of integration — bringing the experience of invisibility into conscious awareness without being swallowed by it.\n\nLet the sound alternate. As it does, you might ask yourself — gently, without forcing — when have I felt most unseen? You do not need to answer. The question itself, held in bilateral sound, begins the integration process. Your brain knows what to do. You just have to let it move.`,
      trilateral: `Tri-Lateral creates an extraordinary effect with this song: the sense of being surrounded — held in three dimensions by something that sees you. The spatial depth wraps Maynard's voice around you rather than across you.\n\nFor anyone whose wound of invisibility runs deep, this mode can feel startlingly like being witnessed. Let it. You do not need to understand it neurologically for it to work physiologically. Just let the sound hold you in space.`,
      quadlateral: `If 3 Libras is activating something that feels too big — if the recognition is sharp rather than soft — the Figure-8 is your regulation anchor.\n\nThe continuous loop does not ask you to go anywhere. It wraps. It holds. The song continues underneath, but the figure-8 gives your nervous system a predictable, rhythmic focal point. Stay with the movement of the sound until your breath slows. Then decide if you want to go deeper.`,
    },
    modeGuidance: `Want to understand the wound → Bi-Lateral\nWant to feel witnessed right now → Tri-Lateral\nThe recognition is too sharp → Figure-8 first, always`,
  },
  {
    id: "iris-diamante-bb",
    title: "Iris",
    artist: "Diamante & Breaking Benjamin",
    archetype: "The One Who Still Wants To Be Known",
    emotionalCluster: "Resilience & The Longing to Be Seen",
    why: `The original Iris by Goo Goo Dolls encoded one of the most universally felt human experiences: "I just want you to know who I am." Not to be loved, not to be fixed — just known. Accurately. Fully. Without the performance.\n\nWhat Diamante and Breaking Benjamin did is add weight to that vulnerability. Breaking Benjamin's production transforms the plea from longing into something harder-won. This is not someone who has not been hurt yet, hoping to be seen. This is someone who has survived something and still — still — wants to be known.\n\nDiamante's voice carries that survival. There is no fragility performed here. The vulnerability is the strength.\n\nThis song sits at the exact bridge between two core Musical DNA clusters: Connection and Longing, and Resilience and Hope. Songs that can hold two emotional truths at once — I have been through something AND I am still reaching — are the rarest kind. They model what your nervous system deeply needs to learn: you can be both wounded and whole.`,
    what: `Iris operates in a fascinating neurological space. The verse-to-chorus build activates the brain's anticipatory reward system — the nucleus accumbens. Your brain learns the pattern and begins releasing dopamine just before the chorus arrives.\n\nFor ADHD and dopamine-dysregulated nervous systems, this song is quietly medicinal. The predictable dopamine arc creates practice. Practice at experiencing anticipation resolving into arrival. At wanting something and receiving it.\n\nThe bilateral or trilateral modes add another layer: as your hemispheres sync with the alternating sound, the emotional content of the chorus — "I just want you to know who I am" — is processed by both your logical and emotional brain simultaneously. The integration that happens in that moment is the opposite of dissociation. It is full presence.\n\nYou are here. You are feeling this. That is not weakness. That is aliveness.`,
    how: {
      bilateral: `Bi-Lateral with Iris is the mode of integration between survival and hope. Let the sound cross as the song builds. When the chorus hits — let it land on both sides equally.\n\nIf you find yourself thinking about someone you want to be known by, or a version of yourself you have not fully claimed yet — that is not distraction. That is exactly where this song wants to take you. Follow it.`,
      trilateral: `Tri-Lateral with this song creates a surrounding container for the emotional build. When the chorus breaks open, it breaks open in three dimensions around you.\n\nThis is the mode if you want to feel the song rather than think about it. Close your eyes. Let the spatial sound hold the emotional charge. Diamante's voice above you, the bass beneath you, the bilateral rhythm through you.`,
      quadlateral: `Figure-8 with Iris is for the moments when wanting to be known feels like too much to hold — when the longing is sharp enough that you need steadying before you can let it move through you.\n\nThe continuous loop holds you while the song plays underneath. Let it be both at once: the steadiness of the figure-8, the reaching of the song. Your nervous system can hold both. That is what it was built for.`,
    },
    modeGuidance: `Integrating past and present self → Bi-Lateral\nWant to feel fully immersed → Tri-Lateral\nThe longing is too sharp right now → Figure-8 to steady first`,
  },
  {
    id: "breathe-me-sia",
    title: "Breathe Me",
    artist: "Sia",
    archetype: "The One Who Asked For Help",
    emotionalCluster: "Vulnerability & Somatic Release",
    why: `Sia wrote Breathe Me in 2004, in the middle of a period she has described as one of the darkest of her life. The song is a direct transcription of a moment of overwhelm — a plea for help from a nervous system that has reached its absolute limit.\n\n"Ouch I have lost myself again / Lost myself and I am nowhere to be found." It is not poetic metaphor. It is the literal experience of dissociation. Of feeling so disconnected from your own body that you are a stranger to yourself.\n\nWhat makes this song a tool is the chorus: "Breathe me." It is not a request for rescue. It is a request for co-regulation. For someone to be present enough that her own nervous system can borrow their stability. To be the anchor that allows her to find her way back to her own breath. It is one of the most honest and vulnerable requests a human can make.`,
    what: `Breathe Me is a masterclass in somatic activation. Sia's voice, particularly in the chorus, is breathy and close-mic'd, creating a sense of intimacy that directly triggers your mirror neuron system. Your brain simulates the act of her breathing, which in turn can regulate your own.\n\nThe piano melody is simple, almost like a lullaby. This predictability is calming to the amygdala, the brain's threat-detection center. It signals safety, creating a container for the emotional intensity of the lyrics.\n\nWhen the strings swell, they occupy the 250-800Hz range, the same frequencies as the human voice in a calm, soothing tone. This creates a physiological sense of being held, allowing the emotional release of the song to happen without overwhelming your system.`,
    how: {
      bilateral: `Use Bi-Lateral to process the feeling of being overwhelmed. As the sound moves left and right, it helps your brain integrate the fragmented sensations that come with anxiety or a panic state. You don't need to think about anything. Just let the sound guide you back to a feeling of wholeness.`,
      trilateral: `Tri-Lateral mode with Breathe Me creates a cocoon of sound. If you are feeling small, fragile, or lost, this mode provides a sense of being held in three-dimensional space. It's the auditory equivalent of a weighted blanket, offering gentle, persistent sensory input that can be deeply grounding.`,
      quadlateral: `If the song itself feels like too much, start with Quad-Lateral. The smooth, predictable figure-8 motion is a powerful tool for nervous system regulation. It gives your brain a simple, rhythmic pattern to focus on, calming the storm inside. Let the sound be your anchor.`,
    },
    modeGuidance: `Feeling fragmented → Bi-Lateral\nNeed to feel held & safe → Tri-Lateral\nActively overwhelmed → Figure-8 to regulate`,
  },
  {
    id: "lack-of-color-dcfc",
    title: "A Lack of Color",
    artist: "Death Cab for Cutie",
    archetype: "The Quiet Reconstructor",
    emotionalCluster: "Introspection & Grayscale to Color",
    why: `This song is about the moment after the storm. Not the pain itself, but the quiet, hollowed-out space that comes after a period of intense emotional turmoil. Ben Gibbard wrote it about the feeling of numbness, of moving through the world in grayscale when you know color exists.\n\n"This is the moment that you know / that you are going to be alone." It's not a cry of despair. It's a statement of fact. A quiet acceptance. The song lives in that space of stillness, of taking stock of what remains after everything has been stripped away.\n\nIt's a song for the reconstructors. For those who have to rebuild from the ground up, not with a grand gesture, but with the slow, patient work of putting one foot in front of the other. It gives permission to be in the quiet, to be in the gray, without needing to rush back to a performance of being okay.`,
    what: `A Lack of Color is sonically designed for introspection. The acoustic guitar is the primary element, its frequencies centered in the range of calm human speech. This creates a sense of a one-on-one conversation, a safe space for reflection.\n\nThe song's structure is incredibly simple and repetitive, which has a regulating effect on the nervous system. There are no sudden changes, no loud bursts. This predictability tells your brain that there is no threat, allowing the prefrontal cortex—the part of your brain responsible for self-awareness and reflection—to come online.\n\nThe final lines, "call it in the air," are repeated, fading out. This acts as a form of auditory mantra, a gentle release that allows the listener to let go of the need for a definitive conclusion.`,
    how: {
      bilateral: `Bi-Lateral mode is for gently processing the feeling of numbness or disconnection. The left-right stimulation can help to awaken dormant emotional pathways, bringing subtle color back to a grayscale world. There is no need to force anything. Just observe what comes up.`,
      trilateral: `Use Tri-Lateral to create a space for quiet contemplation. The three-dimensional sound field can feel like being in a small, safe room, perfect for turning inward. It's a mode for being with yourself, without the pressure of the outside world.`,
      quadlateral: `The Figure-8 is the mode for pure regulation. If the quiet feels too empty, if the stillness is unsettling, the smooth, looping pattern of Quad-Lateral provides a gentle, constant anchor. It's a way to find rhythm in the stillness, a steady heartbeat in the quiet.`,
    },
    modeGuidance: `Processing numbness → Bi-Lateral\nCreating a space for reflection → Tri-Lateral\nStillness feels unsettling → Figure-8 for rhythm`,
  },
  {
    id: "like-a-stone-audioslave",
    title: "Like a Stone",
    artist: "Audioslave",
    archetype: "The One Waiting to Arrive",
    emotionalCluster: "Searching & Sacred Stillness",
    why: `Chris Cornell wrote this song about waiting. Not waiting for a person, but waiting for death, for an afterlife, for some kind of resolution. He imagines himself in a room, reading, waiting for his time to come, and reflecting on the life he has lived.\n\n"In your house I long to be / Room by room patiently / I'll wait for you there / like a stone." It's a song of profound stillness, of acceptance of the inevitable. But it's also a song of searching, of wondering if the life lived was enough.\n\nFor anyone who has ever felt like they are in a liminal space, a waiting room of life, this song is a powerful anthem. It gives voice to the quiet dignity of waiting, and the deep human need to find peace with the past before stepping into whatever comes next.`,
    what: `The song's power lies in its dynamic range. The verses are quiet, almost spoken, with a simple, clean guitar line. This draws the listener in, creating a sense of intimacy. Your brain leans in to listen.\n\nThen the chorus explodes. This sudden shift in volume and intensity triggers a release of dopamine and norepinephrine in the brain, the same neurochemicals associated with catharsis and emotional release. It's a cycle of tension and release that mirrors the process of emotional processing.\n\nCornell's voice is the key. It moves from a gentle baritone to a powerful, soaring tenor, covering a huge frequency range. This vocal athleticism is, in itself, a neurological workout for the listener, activating a wide range of emotional and auditory pathways.`,
    how: {
      bilateral: `Use Bi-Lateral to process the feeling of being in-between, of waiting. The left-right movement can help to integrate the past and the future, the life lived and the one to come. It's a mode for finding peace in the present moment, even if that moment is one of waiting.`,
      trilateral: `Tri-Lateral mode with this song creates a vast, cathedral-like space. It's for contemplating the big questions, for feeling the scale of your own life. The three-dimensional sound makes the chorus feel like it's coming from all around you, a truly immersive experience of catharsis.`,
      quadlateral: `If the chorus feels too intense, if the emotional release is overwhelming, use Quad-Lateral to stay grounded. The figure-8 pattern provides a steady, predictable anchor, allowing you to experience the catharsis of the song without being swept away by it. It's a way to touch the fire without getting burned.`,
    },
    modeGuidance: `Processing a life transition → Bi-Lateral\nContemplating the big picture → Tri-Lateral\nChorus is too intense → Figure-8 to ground`,
  },
  {
    id: "staring-at-the-sun-tvotr",
    title: "Staring at the Sun",
    artist: "TV on the Radio",
    archetype: "The Witness Who Stayed",
    emotionalCluster: "Resilience & Unflinching Presence",
    why: `This song is not about looking away. It's about the opposite. It's about the courage to face the blinding, overwhelming truth of a situation, even when it hurts. The act of staring at the sun is an act of defiance, of refusing to be intimidated by the sheer intensity of reality.\n\n"Staring at the sun / I'm not going to run." It's a declaration of presence. A commitment to stay, to witness, to not flinch, no matter how difficult it is. The song is a testament to the strength it takes to simply be present with what is.\n\nFor anyone who has had to face a hard truth, a painful reality, or a difficult choice, this song is an anthem of resilience. It's not about fixing or changing the situation. It's about having the courage to see it for what it is, and to not look away.`,
      what: `The song's dense production creates a sense of being enveloped, of being held within the intensity. The layers of guitars, vocals, and percussion create a texture that can be both overwhelming and deeply comforting.\n\nThe driving, repetitive rhythm acts as a powerful regulating force for the nervous system. It's a steady, predictable beat that you can lock into, an anchor in the storm of sound. This is why the song can feel both chaotic and grounding at the same time.\n\nTunde Adebimpe's vocals are a mix of soaring falsetto and raw, shouted declarations. This wide emotional range activates a correspondingly wide range of your own emotional centers, from the vulnerability of the falsetto to the power of the shout.`,
    how: {
      bilateral: `Use Bi-Lateral to build your capacity to hold intensity. The left-right stimulation can help your brain to process the dense sonic information of the song without becoming overwhelmed. It's a way to practice staying present in the face of intensity.`,
      trilateral: `Tri-Lateral mode turns the song into a swirling vortex of sound. It's an immersive, full-body experience. Use this mode when you need to feel the power of your own resilience, to be reminded of your own strength.`,
      quadlateral: `If the sound is too much, Quad-Lateral can help you find a focal point. The figure-8 pattern provides a smooth, predictable path for your attention to follow, allowing you to navigate the intensity of the song without getting lost in it. It's a way to find the eye of the storm.`,
    },
    modeGuidance: `Building capacity for intensity → Bi-Lateral\nFeeling your own power → Tri-Lateral\nNavigating the chaos → Figure-8 as an anchor`,
  },
  {
    id: "linger-cranberries",
    title: "Linger",
    artist: "The Cranberries",
    archetype: "The Gentle Ache",
    emotionalCluster: "Connection & Longing",
    why: `Dolores O'Riordan wrote Linger about her first kiss, and the feeling of being let down, of a promise unfulfilled. It's a song about the sweet, sad ache of a connection that was real, but not built to last.\n\n"But I'm in so deep / You know I'm such a fool for you / You got me wrapped around your finger." It's a portrait of vulnerability, of the power that another person can have over us when we open our hearts to them.\n\nWhat makes the song so enduring is its honesty. There is no anger, no bitterness. Just the quiet, lingering sadness of a love that was true, but not meant to be. It gives permission to feel the ache, to honor the memory, without needing to erase it.`,
    what: `The song's magic is in its gentleness. The string arrangement creates a soft, pillowy bed of sound that is deeply comforting to the nervous system. It's the sonic equivalent of a hug.\n\nDolores O'Riordan's voice is the centerpiece. Her unique vocal style, with its sudden shifts into yodeling-like falsetto, creates a sense of vulnerability and emotional rawness. This vocal signature is instantly recognizable to the brain and can trigger a strong empathetic response.\n\nThe simple, repetitive chord progression is like a gentle rocking motion, lulling the listener into a state of calm reflection. It's a safe space to feel the bittersweet emotions of the song.`,
    how: {
      bilateral: `Use Bi-Lateral to gently process feelings of longing or heartbreak. The left-right stimulation can help to integrate the sweet and the sad, the love and the loss. It's a mode for honoring the past without getting stuck in it.`,
      trilateral: `Tri-Lateral mode wraps you in the warmth of the string section. It's a mode for deep comfort, for allowing yourself to be held by the music. If you are feeling raw or vulnerable, this mode provides a safe and gentle container.`,
      quadlateral: `The Figure-8 is for when the ache feels too sharp. The smooth, continuous motion of the sound can be incredibly soothing, a gentle distraction that allows you to feel the emotion of the song without being overwhelmed by it. It's a way to find the sweetness in the sadness.`,
    },
    modeGuidance: `Processing heartbreak → Bi-Lateral\nSeeking comfort & warmth → Tri-Lateral\nThe ache is too sharp → Figure-8 to soothe`,
  },
  {
    id: "letting-the-cables-sleep-bush",
    title: "Letting the Cables Sleep",
    artist: "Bush",
    archetype: "The One Who Went Quiet",
    emotionalCluster: "Introspection & Surrender",
    why: `Gavin Rossdale wrote this song for a friend who was dying of AIDS. It's about the moment of surrender, of letting go of the fight and finding peace in the quiet. The "cables" are the connections to this world, the things that keep us tethered. Letting them sleep is an act of release.\n\n"Whatever you say, it's alright / Whatever you do, it's all good." It's a song of unconditional acceptance, of giving permission for the struggle to end. It's a lullaby for a tired soul.\n\nFor anyone who has been fighting a long battle—with illness, with addiction, with themselves—this song is a gentle hand on the shoulder, a quiet voice saying, "It's okay to rest now." It's a song about the grace that can be found in surrender.`,
    what: `The song is built on a foundation of electronic textures and a simple, looping drum machine beat. This creates a hypnotic, trance-like state, slowing down the listener's brainwaves and inducing a state of calm relaxation.\n\nThe string section provides a layer of warmth and emotional depth, while the electronic elements create a sense of detachment, of floating. It's a sonic representation of the experience of letting go, of drifting into a state of peace.\n\nRossdale's voice is soft and breathy, almost a whisper. This intimate vocal style triggers a sense of safety and trust, allowing the listener to relax and surrender to the music.`,
    how: {
      bilateral: `Use Bi-Lateral to process the act of letting go. The left-right stimulation can help to release stored tension and emotion, allowing for a deeper sense of peace and surrender. It's a mode for finding the quiet at the center of the storm.`,
      trilateral: `Tri-Lateral mode creates a sense of being suspended, of floating in a warm, safe space. It's a mode for deep relaxation and meditation. If you are struggling to let go of control, this mode can help you to feel safe enough to surrender.`,
      quadlateral: `The Figure-8 is the ultimate mode of surrender. The smooth, continuous loop is a powerful tool for quieting the mind and calming the body. It's a way to let the music carry you, to let go of all effort and just be.`,
    },
    modeGuidance: `Processing the act of letting go → Bi-Lateral\nDeep relaxation & meditation → Tri-Lateral\nTotal surrender → Figure-8`,
  },
  {
    id: "sunburn-fuel",
    title: "Sunburn",
    artist: "Fuel",
    archetype: "The One Still Burning",
    emotionalCluster: "Catharsis & Unresolved Fire",
    why: `Sunburn is a song about the aftermath of a toxic relationship, the feeling of being burned by someone you loved. It's about the anger, the resentment, and the pain that lingers long after the fire has gone out.\n\n"And in the dark I feel the pain / It's a sunshine in my veins." It's a powerful metaphor for the way that pain can become a part of us, a constant source of heat and light, even when we wish it would fade.\n\nThis song is for anyone who has ever been burned by love. It's a validation of the anger, a permission slip to feel the fire. It's not a song about forgiveness or closure. It's a song about the raw, unfiltered reality of being hurt, and the strange, burning power that can be found in that pain.`,
    what: `The song's power comes from its raw, aggressive energy. The distorted guitars, pounding drums, and Brett Scallions' powerful vocals create a sonic assault that is both cathartic and overwhelming.\n\nThe verse-chorus-verse structure, with its dramatic shifts in dynamics, is a classic example of tension and release. The quiet, brooding verses build to an explosive chorus, mirroring the cycle of anger and resentment.\n\nThe song is in a minor key, which is often associated with sadness and anger. The driving rhythm and aggressive instrumentation tap into the brain's fight-or-flight response, providing a safe and contained way to experience and release these powerful emotions.`,
    how: {
      bilateral: `Use Bi-Lateral to process and release anger. The left-right stimulation can help to move the energy of anger through your system, preventing it from getting stuck and turning into resentment. It's a mode for healthy, productive rage.`,
      trilateral: `Tri-Lateral mode turns the song into a full-body experience of catharsis. The three-dimensional sound field allows you to be completely immersed in the energy of the song, to shout, to scream, to let it all out. It's a safe space to feel the fire.`,
      quadlateral: `If the anger feels too overwhelming, use Quad-Lateral to stay grounded. The figure-8 pattern provides a steady, predictable anchor, allowing you to ride the waves of anger without being consumed by them. It's a way to feel the fire without getting burned.`,
    },
    modeGuidance: `Releasing anger → Bi-Lateral\nFull-body catharsis → Tri-Lateral\nAnger is overwhelming → Figure-8 to ground`,
  },
  {
    id: "messy-lola-young",
    title: "Messy",
    artist: "Lola Young",
    archetype: "The One Who Said It Out Loud",
    emotionalCluster: "Radical Honesty & The Unfiltered Wound",
    why: `Lola Young wrote Messy at 22, and what makes it extraordinary is that she did not clean it up. She did not sand down the edges or make the pain more palatable. She said: I am a mess. I know I am a mess. And I am going to sing it directly into your face.\n\n"I know I'm a mess / But I'm the mess that you wanted." That line is not a confession of weakness. It is a reclamation. It is someone refusing to perform the version of themselves that is easier for other people to hold.\n\nFor anyone who has ever been told — explicitly or implicitly — that their emotional reality is too much, too loud, too complicated, this song is a permission slip. You do not have to be tidier. You do not have to be easier. You are allowed to take up the space you actually need.\n\nThis is one of the most GestaltView-aligned songs in the entire corpus. The PLK — the Personal Language Key — is built on the principle that your unfiltered voice is the most important data. Lola Young did not let anyone edit hers.`,
    what: `Messy operates in the frequency range of raw emotional truth — Lola's voice sits in the 300–600Hz band, the range associated with intimacy, directness, and emotional confrontation. There is no reverb softening the edges. No production gloss to create distance. The sound is close and immediate, which is neurologically activating.\n\nYour amygdala — the brain's threat-detection system — will respond to this song's directness. That is not a problem. That is the point. The song is asking you to stay present with something that might usually trigger a flight response.\n\nThe beat is steady and grounding beneath the emotional volatility of the lyrics. This is intentional. The nervous system needs a floor to stand on when it is processing something intense. The rhythm provides that floor. You can feel the fire because the ground is holding you.\n\nResearch on expressive writing (Pennebaker, 1997) shows that naming difficult emotions — saying them out loud, or hearing them said — reduces their physiological intensity. Lola Young is doing the naming for you. Your body is allowed to exhale.`,
    how: {
      bilateral: `Bi-Lateral is the integration mode for this song. The left-right alternation will help your brain process the emotional charge of the lyrics — moving the energy through rather than letting it pool.\n\nIf something in this song is landing close to home, let it. The bilateral stimulation is holding you while you feel it. You do not have to do anything with what comes up. Just let the hemispheres talk to each other.`,
      trilateral: `Tri-Lateral turns this song into a full surround-sound confrontation with yourself. The three-point spatial field means the honesty of the song is coming from everywhere — not just left and right, but above and below.\n\nUse this mode if you need to feel the full weight of what the song is saying. If you have been minimizing something, Tri-Lateral will make it harder to look away. That is not cruelty. That is clarity.`,
      quadlateral: `If Messy is activating something that feels too big — if the directness of it is overwhelming rather than liberating — start with Figure-8.\n\nThe smooth, looping path gives your nervous system a predictable anchor. You can hear the song from a safer distance, let it be present without being consumed by it. When you feel steadier, you can move to Bi-Lateral and go deeper.`,
    },
    modeGuidance: `Ready to integrate → Bi-Lateral\nNeed full confrontation → Tri-Lateral\nFeeling overwhelmed → Figure-8 first`,
  },
  {
    id: "runaway-aurora",
    title: "Runaway",
    artist: "Aurora",
    archetype: "The One Who Chose Themselves",
    emotionalCluster: "Liberation & Sacred Self-Preservation",
    why: `Aurora wrote Runaway when she was 11 years old. She did not know what it meant yet. She just knew that something in her needed to move — away from something, toward something, through something.\n\n"And I'll run away / With you." On the surface it sounds like a love song. But Aurora has said it is about running toward yourself. About the moment you stop performing the version of yourself that other people need and start moving in the direction of who you actually are.\n\nThis song has become an anthem for people who have been through things that required them to disappear for a while — from relationships, from families, from versions of themselves that were slowly suffocating them. It is a song about the courage it takes to leave, and the strange, terrifying, sacred feeling of choosing yourself for the first time.\n\nIf this song is finding you right now, something in you is already moving. You may not know where yet. That is okay. Aurora did not know either when she was 11. She just started running.`,
    what: `Aurora's voice is one of the most neurologically distinctive in contemporary music. She sings in a frequency range — particularly her upper register — that activates the brain's default mode network, the system associated with self-referential thought, memory, and imagination.\n\nWhen you hear her voice, your brain does not just process sound. It begins to tell itself a story about you. This is why Runaway feels so personal even if you have never met Aurora and your life looks nothing like hers.\n\nThe song builds slowly — a sparse piano opening, then her voice, then layers that accumulate like courage accumulates: slowly, then all at once. This structural arc mirrors the neurological experience of making a major life decision. The quiet before. The moment of commitment. The release.\n\nResearch on music and self-determination (Ryan & Deci, 2000) shows that music which activates the default mode network can strengthen a person's sense of autonomous identity — their felt sense of being the author of their own life. Runaway is doing exactly this. It is reminding your nervous system that you are the one who gets to decide.`,
    how: {
      bilateral: `Bi-Lateral with Runaway is a powerful combination for anyone in the middle of a transition — leaving something, starting something, unsure of the ground beneath them.\n\nThe left-right alternation will help integrate the fear and the hope that coexist in any real act of self-determination. Let both hemispheres hold the complexity. You do not have to resolve it. You just have to keep moving.`,
      trilateral: `Tri-Lateral mode with Runaway creates a sense of being held in open space — not the claustrophobic safety of a small room, but the expansive safety of sky. It is the mode for people who need to feel that the world is large enough to run toward.\n\nIf you have been feeling trapped — by circumstance, by other people's expectations, by your own fear — Tri-Lateral will help your nervous system remember that there is more space than the space you are currently in.`,
      quadlateral: `The Figure-8 with Runaway is for the moment before the decision. The moment when you know what you need to do but cannot yet make yourself do it.\n\nThe continuous, looping path of the sound mirrors the circular thinking that precedes a leap. Let it loop. Let the song play. Sometimes the body needs to hear something enough times before it believes it is allowed to move.`,
    },
    modeGuidance: `In the middle of a transition → Bi-Lateral\nNeed to feel open space → Tri-Lateral\nBefore the leap → Figure-8 to prepare`,
  },
];

// ─── Tab Config ──────────────────────────────────────────────────────────────

const tabConfig: { id: InsightTab; label: string; icon: string }[] = [
  { id: "why", label: "Why This Song", icon: "🤔" },
  { id: "what", label: "What's Happening", icon: "🧠" },
  { id: "how", label: "How To Use It", icon: "🎧" },
];

// ─── Main Component ─────────────────────────────────────────────────────────────

export const InsightWindow: React.FC<InsightWindowProps> = ({ song, activeMode, onClose, isOpen }) => {
  const [activeTab, setActiveTab] = useState<InsightTab>('why');

  const getContent = (): string => {
    if (activeTab === "why")  return song.why;
    if (activeTab === "what") return song.what;
    return song.how[activeMode];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="insight-window"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
            <div className="insight-header">
              <div className="insight-title-section">
                <h2>{song.title}</h2>
                <h3>{song.artist}</h3>
              </div>
              <button onClick={onClose} className="insight-close-btn">×</button>
            </div>

            <div className="insight-archetype-banner">
              <p><strong>Archetype:</strong> {song.archetype}</p>
              <p><strong>Emotional Cluster:</strong> {song.emotionalCluster}</p>
            </div>

            <div className="insight-tabs">
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  className={`insight-tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="insight-tab-icon">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="insight-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + activeMode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p>
                    {getContent().split('\n\n').map((paragraph, i) => (
                      <span key={i}>{paragraph}<br/><br/></span>
                    ))}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {activeTab === 'how' && (
              <div className="insight-mode-guidance">
                <h4>Mode Guidance</h4>
                <p>
                  {song.modeGuidance.split('\n').map((line, i) => (
                    <span key={i}>{line}<br/></span>
                  ))}
                </p>
              </div>
            )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};
