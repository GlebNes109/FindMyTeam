from typing import Protocol
from domain.models.participants import ParticipantsBasicRead

from domain.models.teams import VacanciesBasicRead


class Sorter(Protocol):
    async def sort_participants(self, event_id , team_id) -> list[ParticipantsBasicRead]: ...

    async def sort_vacancies(self, event_id , participant_id) -> list[VacanciesBasicRead]: ...