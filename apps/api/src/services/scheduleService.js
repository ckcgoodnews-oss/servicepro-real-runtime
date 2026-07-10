function toTime(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    const err = new Error(`Invalid date/time: ${value}`);
    err.status = 400;
    err.code = 'invalid_datetime';
    throw err;
  }
  return time;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return toTime(aStart) < toTime(bEnd) && toTime(bStart) < toTime(aEnd);
}

function findConflicts(existingAppointments, candidate) {
  return existingAppointments.filter(appt => {
    if (appt.status === 'cancelled') return false;
    if (appt.technicianId !== candidate.technicianId) return false;
    return overlaps(appt.startTime, appt.endTime, candidate.startTime, candidate.endTime);
  });
}

function validateAppointmentInput(input) {
  if (!input.jobId) {
    const err = new Error('jobId is required');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
  if (!input.technicianId) {
    const err = new Error('technicianId is required');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
  if (!input.startTime || !input.endTime) {
    const err = new Error('startTime and endTime are required');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
  if (toTime(input.endTime) <= toTime(input.startTime)) {
    const err = new Error('endTime must be after startTime');
    err.status = 400;
    err.code = 'validation_failed';
    throw err;
  }
}

module.exports = { overlaps, findConflicts, validateAppointmentInput };
