---
title: RecoveryDAgger
summary: '領導 4 人團隊實現Imitation Learning演算法 RecoveryDAgger，顯著減少專家查詢次數。利用 PyTorch 與 SB3 獨力設計專家策略與訓練管線，於 30 支多為研究生的隊伍中斬獲季軍，成果已獲 IEEE Potentials 錄取。'
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
myself, in PyTorch and Stable-Baselines3. The expert is a rule-based controller
that steers toward the goal from the current state — deterministic, 100% success
on the task — and it generates the 100-trajectory offline dataset every method
in the paper starts from. Behaviour cloning on that dataset lands at roughly 26%
success, which is exactly the gap online training has to close.

The design decision I care most about is how recovery actually produces an
action. PointMaze has a continuous action space (forces along x and y), so the
obvious version of recovery — enumerate candidate actions, take the arg max of
the Success Q-function — is not available. We instead start from the action the
imitation policy already proposed and run a few steps of gradient ascent on the
Success Q-function with respect to the action, projecting back into the valid
range after each step. Recovery is a local correction of the policy's own
intent, not a second controller fighting it.

The other decision was to stop trusting a single Q-network. One learned Success
Q is only an approximation, and recovery follows its gradient, so its errors get
amplified rather than averaged out. We trained an ensemble instead: the ensemble
mean defines risk, the ensemble variance defines novelty, and the recovery
objective subtracts a penalty λ·Var(Q) so recovery never climbs toward states
the ensemble disagrees about. One family of networks ends up serving all three
roles — risk detector, novelty detector, and recovery direction.

## Results

Evaluated on a four-room PointMaze navigation task against ThriftyDAgger, the
standard query-efficient baseline. Every method starts from the same
behaviour-cloned policy.

| Method | Expert queries | Recovery queries | Success rate |
| --- | --- | --- | --- |
| Behaviour cloning | — | — | 0.26 |
| ThriftyDAgger (baseline) | 20,048 | — | 0.81 |
| Single-Q recovery (ours) | 2,504 | 9,232 | 0.86 |
| Ensemble-Q recovery (ours) | 2,693 | 9,296 | 0.88 |

Ensemble-Q recovery ends up more accurate than the baseline while querying the
expert **7.4× less often**. Partway through training the gap is even wider: both
recovery variants reach ~0.7 success after about 2k expert queries, where
ThriftyDAgger needs roughly 20k to get to the same place.

The interesting part is *where* the savings come from. Most of what a risk-gated
method spends its query budget on is not genuinely unfamiliar — it is
recoverable: local deviations near a doorway or a wall that the agent could fix
by itself. Separating "novel" from "merely risky" is what buys the 7.4×.

The project placed 3rd among 30 teams, most of them graduate students, and the
work has been accepted to IEEE Potentials.

