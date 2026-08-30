# The Living Temple: Member Welcome Form

**Built 2026-08-29.** Sent AFTER purchase, in the welcome email. Not a gate, not an application
in the screening sense. Sandi's framing to members: *"so I can serve the field best."* That is
genuinely true and it is also the largest voice-of-customer mine she will ever run on her
warmest segment.

**Register:** Direct / Piercing (brand voice profile, section 4). The pattern is a sharp specific
ask held immediately in safety. No em dashes. No "Not X, it's Y" constructions. Never
"performance." "s+" never spelled out.

**Build in Google Forms.** Google Forms API is live, see memory `google_forms_api`.
Estimated completion: 8 to 10 minutes. Say so on the form.

**✅ BUILT IN GOOGLE FORMS 2026-08-29 via the Forms API.** Live and accepting responses.
- Fill-in link: https://forms.gle/6kS4UB9ZiY7SPkw89
- Edit / responses: https://docs.google.com/forms/d/1HwOKQQyTzODX-X1wqIkQOcexjsqzS9G3ewAb_c3tbK4/edit
- formId `1HwOKQQyTzODX-X1wqIkQOcexjsqzS9G3ewAb_c3tbK4` (also in `living-temple-welcome-form.json`)
- 20 questions: the 18 below, plus "Your email, the one you used on Hipsy" (to match buyers) and the
  standing "How do you identify?" field. 5 sections. Optional: WhatsApp, socials info, Q16, Q18.
- Closing text lives as a final text block on the last page (the API cannot set the confirmation message).
- Linked from the Hipsy confirmation message in `living-temple-hipsy-listing.md`.

---

## INTRO TEXT

> You're in.
>
> Before the first circle, I want to know who is actually in this room. Not to judge your
> answers. So I can build the thing around the people in it rather than around an idea of them.
>
> I read every one of these myself. What you write here shapes what this room becomes,
> genuinely, not as a nice thing to say on a form.
>
> Ten honest minutes, whenever you have them. Say the true thing rather than the good-sounding one.

---

## SECTION 1: The practical

**1.** Your name, as you want it said out loud in circle. *(short answer)*

**2.** Your pronouns. *(short answer)*

**3.** WhatsApp number for the members' circle. You can skip this and stay email-only.
*(short answer, optional)*

**4.** Anything I should know for the socials: food, access, anything that makes a room easier
or harder for you. *(paragraph, optional)*

---

## SECTION 2: What brought you here

**5.** How did you first find Medicine Within? *(multiple choice)*
- A friend told me
- Hipsy
- Instagram
- A temple night I was brought to
- Google or a search
- Newsletter
- Somewhere else *(other)*

**6.** How many Medicine Within temple nights have you been to? *(multiple choice)*
- This will be my first season, one night so far
- Two or three
- Four to six
- More than six, I have lost count

**7.** What actually happens to you in the days after a temple night?
*(paragraph)*

**8.** Finish this sentence in your own words: "I keep coming back to temple because ___"
*(short answer)*

---

## SECTION 3: What you're actually looking for

**9.** In your own words, what are you hoping this room gives you? Say it how you would say it
to a friend, not how you think it should sound. *(paragraph)*

**10.** What have you been looking for and not been able to find anywhere? *(paragraph)*

**11.** If this room works exactly as you hope, what is different in your life six months from
now? Name something concrete, outside the temple. *(paragraph)*

---

## SECTION 4: What has gone wrong before

**12.** What has gone wrong for you in a community space before? *(paragraph)*

**13.** What would make you feel genuinely safe in an ongoing room with other people from
temple? *(paragraph)*

**14.** Be honest: what almost stopped you from joining? *(paragraph)*

**15.** What would make you leave? *(paragraph)*

---

## SECTION 5: How to hold you well

**16.** What are you working with right now, in your body or your life, that this room should
know about? Only as much as you want to say. *(paragraph, optional)*

**17.** What would make this worth showing up to every month, honestly? *(paragraph)*

**18.** Is there anything you are afraid to tell me, but that I should probably know? Name it
here and it stays between us. This is a safe space. *(paragraph, optional)*

---

## CLOSING TEXT

> Thank you. Genuinely.
>
> The first circle gathers on the autumn equinox, Tuesday 22 September. You will get the link
> and the rhythm before then.
>
> With wild love & devotion,
> Sandi

---
---

# BACK END: what each question is actually mining

**Do not put this section in the form.** This is the strategy layer.

| Q | Visible purpose | What it mines |
|---|---|---|
| 5 | Friendly opener | **Attribution.** Forms gold says Hipsy 36% and word of mouth 24% against Instagram 9%. This confirms it on the warmest segment and tells her where to spend. |
| 6 | Context | **Segmentation.** Separates first-season from long-timers so she can compare their answers. The heavy repeat buyers are 55% of revenue. |
| 7 | Care | **The drop, in their words.** Feeds the problem section of every future sales page. Already the page's strongest section, this refills it. |
| 8 | Warm | **Headline copy.** Sentence completion produces usable lines. This is the single highest-yield copy question on the form. |
| 9 | Understanding them | **Raw VOC.** "How you would say it to a friend" is the instruction that strips the spiritual dialect and gets Tier 1 language. Direct input to headlines and hooks. |
| 10 | Serving them | **The gap, and the enemy.** What the market is not giving them is her positioning. Feeds brand brain and the enemy line. |
| 11 | Vision | **Outcome language.** "Concrete, outside the temple" is what turns a features page into a benefits page. |
| 12 | Safety design | **Objection and risk.** Joe's research says this is the buying decision. Every answer is a thing the agreements section must cover. |
| 13 | Safety design | **Product design.** Direct instruction for the agreements and the room rules. |
| 14 | Honesty | **The objection list.** The most commercially valuable question here. Every answer belongs in an FAQ or a sales page. She has never asked buyers this. |
| 15 | Retention | **Churn prevention**, asked before churn happens, at the moment of highest goodwill. |
| 16 | Facilitation | Real facilitation input, plus early warning on anyone needing more care. |
| 17 | Retention | **What the offer must deliver.** Tells her which of the four inclusions is actually load-bearing. |
| 18 | Trust | Her signature closer, verbatim from the voice guide. Consistently produces the most useful answer on her forms. |

## How to work the mine

1. **Tag every answer to Q8, Q9 and Q10 into the conversation gold file** (`conversation-gold.md`
   and the Mission Control Quotes tab). Those three are the copy bank.
2. **Q14 becomes the FAQ.** Answer each objection on the page before the next launch.
3. **Q5 goes into the channel decision.** If Hipsy and word of mouth win again, that settles the
   Instagram question for the year.
4. **Q12 and Q13 rewrite the agreements section** if anything new comes up.
5. Gender is not asked here. See memory `forms_gender_question`: the standing gender field goes
   on all non-women-only forms. **Add it to Section 1 to match the other 43 forms.**

## Related
`.masterminds-context/living-temple-copy-kit.md` · `forms-gold-2026-08-27.md` ·
`~/Medicine-Within-Brand-Voice-Profile.md` section 4 (Direct / Piercing) · memory
`conversation_gold_mine`, `forms_gender_question`, `womens_language_bank`
