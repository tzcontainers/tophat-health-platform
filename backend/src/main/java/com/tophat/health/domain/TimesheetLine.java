package com.tophat.health.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "timesheet_lines")
@Getter
@Setter
public class TimesheetLine {
    @Id
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timesheet_id", nullable = false)
    private Timesheet timesheet;
    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
    @Column(name = "break_minutes", nullable = false)
    private int breakMinutes;
    @Column(name = "hours_worked", nullable = false)
    private BigDecimal hoursWorked;
}
