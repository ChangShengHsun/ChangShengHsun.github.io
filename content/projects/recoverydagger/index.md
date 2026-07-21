---
title: RecoveryDAgger
summary: 'Led a 4-person team building RecoveryDAgger, a query-efficient imitation learning algorithm that lets the agent recover from risky states on its own instead of calling the expert. Designed the expert policy and the whole training pipeline single-handedly in PyTorch and SB3. Placed 3rd among 30 teams, most of them graduate students; accepted to IEEE Potentials.'
date: 2025-09-01
date_end: 2025-12-31

links:
  - type: code
    url: https://github.com/NTU-RL2025-02/RecoveryDAgger
  - type: pdf
    url: https://github.com/NTU-RL2025-02/RecoveryDAgger/blob/main/Report.pdf
  - type: slides
    url: https://docs.google.com/presentation/d/1ntnNjOAhUretADrlI4ycZFx2BClxzAWE0GYV3HPjv28/edit?usp=sharing

tags:
  - Imitation Learning
  - Reinforcement Learning
  - Python
---

**Sep – Dec 2025**

## The problem

Imitation learning lets an agent pick up complex behaviour from expert
demonstrations, but plain behaviour cloning drifts. Small errors push the agent
into states the expert never demonstrated, and from there the mistakes compound.

DAgger fixes the drift by querying the expert on the states the learner actually
visits. That works, but it asks constantly — and expert supervision is the
expensive part of the whole setup.

## What we built

RecoveryDAgger keeps DAgger's interactive loop but adds a cheaper first response
to trouble. In a risky state the agent does not call the expert straight away.
It first runs a **recovery policy** that corrects itself locally by ascending the
gradient of a learned **Success Q-function** — a network that estimates the
probability the task will still be completed from the current state. The expert
is queried only when recovery is unreliable, which is to say only when the state
is genuinely novel.

The point is to spend expert supervision on new information, rather than on
situations the agent could have dug itself out of.

## My role

I led a four-person team and built the expert policy and the training pipeline
myself, in PyTorch and Stable-Baselines3.

<!-- TODO(Ivan): 這裡補「最難的一個技術決策」。
     例如：Success Q-function 為什麼用梯度上升而不是別的做法？
     中途有沒有試過什麼行不通、後來換掉的？
     這段最能看出你的判斷力，比列技術棧有價值。 -->

## Results

Evaluated on the PointMaze navigation task against ThriftyDAgger, a strong
query-efficient baseline. RecoveryDAgger cut the number of expert queries
substantially while keeping the success rate comparable.

<!-- TODO(Ivan): 補具體數字，說服力差很多。
     查詢次數減少百分之多少？成功率各是多少？
     這些在你的 Report.pdf 裡，翻出來填進去。 -->

The project placed 3rd among 30 teams, most of them graduate students, and the
work has been accepted to IEEE Potentials.

## What I would do differently

<!-- TODO(Ivan): 補限制與反思。方法在什麼情況下會失效？
     只在 PointMaze 上驗證過，換到更高維度的任務會遇到什麼？
     多數人不寫這段，寫了最顯成熟度。 -->
