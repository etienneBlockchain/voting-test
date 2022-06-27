Ce dépôt a pour but de tester le Smart Contract "Voting" réalisé sur l'exercice précédent.

# Prérequis
Pour éxecuter l'application, vous devez avoir les éléments suivants :
* NodeJs
* Truffle
* Ganache

# Installation
Pour installer les dépendances, il faut utiliser la commande suivante :
```bash
$ npm install
```

# Tests
Pour lancer les tests, il faut utiliser la commande suivante :
```bash
$ truffle test
```

# Détails des tests - (46)

## 1 - Tests de l'ajout de votants
* Vérifier que la fonction "addVoter" existe
* Vérifier que la fonction "getVoter" existe
* Vérifier que l'administrateur est le seul à pouvoir ajouter des votants
* Vérifier qu'un votant est le seul à pouvoir voir les participants
* Vérifier l'événement "VoterRegistered"
* Vérifier que la fonction "getVoter" renvoie un tableau
* Vérifier que "isRegistered" a bien été modifié
* Vérifier que le votant n'existe pas déjà dans la liste blanche
* Vérifier que le statut de vote est bien sur "RegisteringVoters"

---

## 2 - Tests de l'ajout des propositions
* Vérifier que la fonction "addProposal" existe
* Vérifier que la fonction "getOneProposal" existe
* Vérifier que le votant est dans la whitelist
* Vérifier que l'on peut ajouter des propositions en fonction du statut
* Vérifier que la proposition n'est pas vide
* Vérifier l'événement "ProposalRegistered"
* Vérifier que "getOneProposal" renvoie un tableau
* Vérifier que la proposition a bien été ajoutée au tableau "proposalsArray" sans être modifiée

---

## 3 - Tests du vote
* Vérifier que la fonction "setVote" existe
* Vérifier que le votant est dans la whitelist
* Vérifier qu'on peut ajouter des propositions uniquement si le statut de vote est bien sur "VotingSessionStarted"
* Vérifier que le votant ne peut pas voter pour une proposition inexistante
* Vérifier que le "hasVoted" a changé pour le votant
* Vérifier que le votant n'a pas déjà voté
* Vérifier l'événement "Voted" après avoir voté

---

## 4 - Tests des résultats
* Vérifier que la fonction "tallyVotes" est bien présente dans le contrat
* Vérifier que l'on peut voir les résultats uniquement si le statut de vote est bien sur "endVotingSession"
* Vérifier que l'admin est le seul à pouvoir voir les résultats
* Vérifier que l'on peut voir les résultats uniquement si le statut de vote est bien sur "endVotingSession"
* Vérifier l'événement "WorkflowStatusChange"
* Vérifier que le bon résultat des votes est envoyé

---

## 5 - Tests du changement des status "workflow"
* Vérifier que la fonction "startProposalsRegistering" est bien présente dans le contrat
* Vérifier que la fonction "endProposalsRegistering" est bien présente dans le contrat
* Vérifier que la fonction "startVotingSession" est bien présente dans le contrat
* Vérifier que la fonction "endVotingSession" est bien présente dans le contrat
* Vérifier que l'admin est le seul à pouvoir changer le statut "startProposalsRegistering"
* Vérifier le passage de RegisteringVoters à ProposalsRegistrationStarted
* Vérifier l'événement "WorkflowStatusChange" au changement de workflow de RegisteringVoters à ProposalsRegistrationStarted
* Vérifier que l'admin est le seul à pouvoir changer le statut "endProposalsRegistering"
* Vérifier le passage de ProposalsRegistrationStarted à ProposalsRegistrationEnded
* Vérifier l'événement "WorkflowStatusChange" au changement de workflow de ProposalsRegistrationStarted à ProposalsRegistrationEnded
* Vérifier que l'admin est le seul à pouvoir changer le statut "startVotingSession"
* Vérifier le passage de ProposalsRegistrationEnded à VotingSessionStarted
* Vérifier l'événement "WorkflowStatusChange" au changement de workflow de ProposalsRegistrationEnded à VotingSessionStarted
* Vérifier que l'admin est le seul à pouvoir changer le statut "endVotingSession"
* Vérifier le passage de VotingSessionStarted à VotingSessionEnded
* Vérifier l'événement "WorkflowStatusChange" au changement de workflow de VotingSessionStarted à VotingSessionEnded
