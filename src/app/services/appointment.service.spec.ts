import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentsService } from './appointment.service';
import { environment } from '../../environments/environment';
import { CreateAppointmentDto, UpdateAppointmentDto } from '../interfaces/appointments';
import { Appointment } from '../interfaces/appointments/appointment.interface';
import { AppointmentStatus } from '../interfaces/appointments/appointmnet-status.enum';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.API_URL}/appointments`;

  const mockAppointment: Appointment = {
    _id: '1',
    property: { _id: 'prop1', title: 'Test Property' } as any,
    agent: { _id: 'agent1', name: 'Agent Smith' } as any,
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    appointmentDate: new Date('2024-01-01T10:00:00Z').toISOString(),
    status: AppointmentStatus.PENDING,
    message: 'Test message',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentsService]
    });
    service = TestBed.inject(AppointmentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should POST to /appointments and return the created appointment', () => {
      const dto: CreateAppointmentDto = {
        propertyId: 'prop1',
        appointmentDate: '2024-01-01',
        message: 'Hello',
        name: 'John',
        email: 'john@example.com',
        phoneNumber: '+1234567890'
      };

      service.create(dto).subscribe(appointment => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockAppointment);
    });
  });

  describe('getAppointments', () => {
    it('should GET from /appointments with correct query params', () => {
      const query = { page: 1, limit: 10, status: AppointmentStatus.PENDING };
      const mockResponse = {
        data: [mockAppointment],
        total: 1, page: 1, limit: 10
      };

      service.getAppointments(query).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(req => req.url === apiUrl && req.params.has('page') && req.params.has('status'));
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('status')).toBe(AppointmentStatus.PENDING);
      req.flush(mockResponse);
    });
  });

  describe('findOne', () => {
    it('should GET from /appointments/:id', () => {
      service.findOne('1').subscribe(appointment => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });
  });

  describe('update', () => {
    it('should PATCH to /appointments/:id', () => {
      const dto: UpdateAppointmentDto = { status: AppointmentStatus.COMPLETED };
      const updatedAppointment = { ...mockAppointment, status: AppointmentStatus.COMPLETED };

      service.update('1', dto).subscribe(appointment => {
        expect(appointment).toEqual(updatedAppointment);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(updatedAppointment);
    });
  });
});
