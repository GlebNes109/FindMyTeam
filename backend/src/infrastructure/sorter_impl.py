from typing import Protocol

from domain.models.participants import ParticipantsBasicRead
from domain.models.teams import VacanciesBasicRead

from domain.interfaces.sorter import Sorter

from domain.interfaces.repositories.events_repository import EventsRepository

from domain.interfaces.repositories.teams_repository import TeamsRepository

from domain.interfaces.repositories.participants_repository import ParticipantsRepository


class SorterImpl(Sorter):
    def __init__(self, teams_repository: TeamsRepository, participants_repository: ParticipantsRepository):
        self.teams_repository = teams_repository
        self.participants_repository = participants_repository

    async def sort_participants(self, event_id , team_id) -> list[ParticipantsBasicRead]:
        team = await self.teams_repository.get_read_model(team_id)
        if not team.vacancies:
            return self.participants_repository.get_all_for_event(event_id, limit=1000, offset=0)
        # выставление весов трекам. Чем больше вакансий с треком, тем больше будет вес
        track_weights = {}
        for vacancy in team.vacancies:
            track_id = vacancy.track.id
            track_weights[track_id] = track_weights.get(track_id, 0) + 1

        # Ключевые слова для релевантной сортировки (из всех вакансий) в один список
        keywords: list[str] = []
        for vacancy in team.vacancies:
            if vacancy.description:
                words = vacancy.description.lower().split()  # TODO: нормальная токенизация
                keywords.extend(words)

        return await self.participants_repository.get_by_event_id_sorted(event_id=event_id, track_weights=track_weights,
                                                                         keywords=keywords)


    async def sort_vacancies(self, event_id , participant_id) -> list[VacanciesBasicRead]:
        participant = await self.participants_repository.get(participant_id)
        track_weight = 1
        keywords = participant.resume.lower().split()
        track_id = participant.track_id
        return await self.teams_repository.get_event_vacancies_sorted(event_id, track_weight, keywords, track_id)
