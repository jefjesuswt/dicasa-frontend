import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Appointment } from "../../../interfaces/appointments";
import { AvatarComponent } from "../../../shared/avatar/avatar.component";

@Component({
  selector: "dashboard-appointment-card",
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: "./dashboard-appointment-card.component.html",
  host: {
    class: "block",
  },
})
export class DashboardAppointmentCardComponent {
  @Input({ required: true }) appointment!: Appointment;
  @Input({ required: true }) statusLabel!: string;
  @Input({ required: true }) statusClass!: string;

  @Output() edit = new EventEmitter<Appointment>();
  @Output() delete = new EventEmitter<Appointment>();

  onEdit() {
    if (!this.appointment.property) return;
    this.edit.emit(this.appointment);
  }

  onDelete() {
    this.delete.emit(this.appointment);
  }
}
