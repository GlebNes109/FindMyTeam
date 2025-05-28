from starlette.responses import JSONResponse

from backend.src.core.config import settings
from backend.src.legacy.db_models.api_models import NewInvitation, NewResponse
from backend.src.legacy.repository.repository import Repository
from backend.src.domain.services.utility_services import make_http_error

repository = Repository()

class EventManagementService():
    def add_new_team(self, new_team, teamlead_id):
        user_db = repository.get_user_by_id(teamlead_id)

        if not user_db:
            return make_http_error(404, "пользователь не найден")

        res = repository.add_new_team(new_team, teamlead_id, new_team.event_id)

        if not res:
            return make_http_error(409, "команда с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)

    def get_events(self, limit=10, offset=10):
        all_events = repository.get_events(limit, offset)

        return JSONResponse(status_code=200, content=all_events)

    def add_event(self, new_event, admin_id):
        admin_db = repository.get_user_by_id(admin_id)

        if admin_db.role not in settings.admins:
            return make_http_error(403, "не админ")

        res = repository.add_new_event(new_event)

        if not res:
            return make_http_error(409, "ивент с такими данными уже есть")

        return JSONResponse(status_code=201, content=None)

    def add_new_participant(self, new_participant, user_id):
        result = repository.add_new_participant(new_participant, user_id)
        if not result:
            return JSONResponse(status_code=400, content=None)

        return JSONResponse(status_code=201, content={"participant_id": result})

    def get_users_events(self, user_id):
        user_events = repository.get_user_events(user_id)
        # if not user_events:
        #    return make_http_error(404, "ивентов нет")
        return JSONResponse(status_code=200, content=user_events)

    def get_event_data(self, event_id):
        event = repository.get_event_by_id(event_id)
        if not event:
            return make_http_error(404, "ивента нет")
        return JSONResponse(status_code=200, content=event.model_dump())

    def get_participation_data(self, ParticipantId):
        participant_data = repository.get_participant_data(ParticipantId)
        if not participant_data:
            return make_http_error(404, "такого нет")
        return JSONResponse(status_code=200, content=participant_data.model_dump())

    def add_invitation(self, invitation: NewInvitation, user_id): # добавление приглашения в команду от тимлида
        # проверка, что participant_id принадлежит этому участнику
        if not self.check_participant_id(user_id, invitation.teamlead_id):
            return make_http_error(403, "пользователь не является участником или id участника некорректный")

        # проверка, что teamlead_id является тимлидом в той команде, в которую подается приглашение
        if not repository.check_vacancy_id(invitation.teamlead_id, invitation.vacancy_id):
            return make_http_error(403, "пользователь не является участником или id участника некорректный")
        repository.add_new_invitation(invitation.vacancy_id, invitation.participant_id, from_teamlead=True)
        return JSONResponse(status_code=201, content=None)

    def add_response(self, response: NewResponse, user_id): # добавление отклика от участника
        if not self.check_participant_id(user_id, response.participant_id):
                return make_http_error(403, "пользователь не является участником или id участника некорректный")
        repository.add_new_invitation(response.vacancy_id, response.participant_id, from_teamlead=False)
        return JSONResponse(status_code=201, content=None)

    def get_responses(self, participant_id, user_id):
        if not self.check_participant_id(user_id, participant_id):
            return make_http_error(403, "пользователь не является участником или id участника некорректный")
        responses = repository.get_responses(participant_id)
        return JSONResponse(status_code=200, content=responses)

    def check_participant_id(self, user_id, participant_id):
        user_events = repository.get_user_events(user_id)
        is_real_participant = False  # проверка, действительно ли participant_id принадлежит этому пользователю
        for event in user_events:
            if event["participant_id"] == participant_id:
                is_real_participant = True
                break
        return is_real_participant

    def get_invitations(self, participant_id, user_id):
        if not self.check_participant_id(user_id, participant_id):
            return make_http_error(403, "пользователь не является участником или id участника некорректный")
        invitations = repository.get_invitations(participant_id)
        return JSONResponse(status_code=200, content=invitations)
