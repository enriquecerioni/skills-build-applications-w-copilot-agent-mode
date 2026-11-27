import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

function asRecord(input: unknown): Record<string, unknown> {
  return input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
}

function requireId(value: unknown, field: string) {
  if (typeof value !== 'string' || !mongoose.isValidObjectId(value) || !/^[0-9a-fA-F]{24}$/.test(value)) {
    throw badRequest(`${field} must be a valid id`);
  }
  return value;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = asRecord(input);
  const userId = requireId(body.userId, 'userId');
  const teamId = requireId(body.teamId, 'teamId');
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const minutes = body.minutes;
  if (!type) throw badRequest('type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw badRequest('minutes must be a number of at least 1');
  }
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user) throw badRequest('user not found', 404);
  if (!team) throw badRequest('team not found', 404);
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type,
    minutes,
    points: Math.max(1, Math.round(minutes)),
    occurredAt: new Date(),
  });
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = asRecord(input);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) throw badRequest('name is required');
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  if (!mascot) throw badRequest('mascot is required');
  const members = Array.isArray(body.members) ? body.members.map((id) => requireId(id, 'members')) : [];
  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map((total) => total._id) } }).lean();
  const names = new Map(teams.map((team) => [team._id.toString(), team.name]));
  return totals
    .filter((total) => names.has(total._id.toString()))
    .map((total) => ({ teamName: names.get(total._id.toString()) as string, totalPoints: total.totalPoints }))
    .sort((a, b) => b.totalPoints - a.totalPoints || a.teamName.localeCompare(b.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const activityFocus: Record<string, string> = {
  run: 'endurance',
  cycle: 'endurance',
  swim: 'endurance',
  walk: 'endurance',
  strength: 'strength',
  lift: 'strength',
};

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw badRequest('user not found', 404);
  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const latest = recent[0];
  const recentFocus = latest ? activityFocus[latest.type.toLowerCase()] : undefined;
  const focus = recentFocus ?? user.fitnessGoal;
  const reason = recentFocus
    ? `Based on your recent ${latest.type} activity, this builds ${focus}.`
    : `Matches your ${user.fitnessGoal} goal.`;
  const workouts = await Workout.find().lean();
  const ranked = [...workouts].sort(
    (a, b) => Number(b.focus === focus) - Number(a.focus === focus) || Number(b.focus === user.fitnessGoal) - Number(a.focus === user.fitnessGoal),
  );
  return ranked.map((workout) => ({ ...workout, reason: workout.focus === focus ? reason : `Alternative to support your ${user.fitnessGoal} goal.` }));
}

export { User };
