import hashlib

from backend.src.domain.interfaces.hash_creator import HashCreator


class sha256HashCreator(HashCreator):
    async def create_hash(self, password):
        sha256hash = hashlib.sha256()
        sha256hash.update(password.encode('utf-8'))
        return str(sha256hash.hexdigest())