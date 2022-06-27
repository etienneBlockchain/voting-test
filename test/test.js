// Test Voting Contract - Etienne
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const Voting = artifacts.require('Voting')

contract('Voting', accounts => {
	let votingInstance
	const owner = accounts[0]
    const voterAuthorized = accounts[1]
    const voterNotAuthorized = accounts[2]

	const proposal1 = 'Première proposition'
	const proposal2 = 'Deuxième proposition'

	// Ensemble de tests pour l'ajout de votant
	describe('Voters registration', () => {
		beforeEach(async function () {
            votingInstance = await Voting.new({ from: owner })
        })

		// On vérifie que la fonction "addVoter" est bien présente dans le contrat
		it('...should exist the function addVoter()', async () => {
			expect(votingInstance.addVoter).to.be.a('function')
		})

		// On vérifie que la fonction "getVoter" est bien présente dans le contrat
		it('...should exist the function getVoter()', async () => {
			expect(votingInstance.getVoter).to.be.a('function')
		})

		// On vérifie que l'admin est le seul à pouvoir ajouter des votants
		it('...should not add voter if the caller is not the admin', async () => {
			await expectRevert(votingInstance.addVoter(owner, { from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// On vérifie qu'un votant est le seul à pouvoir voir un autre participant
		it('...should not get voter if the caller is not a voter', async () => {
			await expectRevert(votingInstance.getVoter(voterAuthorized, { from: voterNotAuthorized }), 'You\'re not a voter')
		})
        
		// On véfifie l'ajout d'un votant en vérifiant l'event "VoterRegistered"
		it('...should add a voter', async function() {
			const voterAdd = await votingInstance.addVoter(voterAuthorized, { from: owner })
			expectEvent(voterAdd, 'VoterRegistered', { voterAddress: voterAuthorized })
		})

		// On vérifie si "getVoter" renvoie un tableau
		it('...should getVoter return an array', async () => {
			await votingInstance.addVoter(voterAuthorized, { from: owner })
			const voterData = await votingInstance.getVoter(voterAuthorized, { from: voterAuthorized })
			expect(voterData).to.be.a('array')
		})

		// On ajoute un votant pour ensuite vérifier que le "isRegistered" a bien été modifié.
		it('...should change "isRegistered" when a voter is added', async function() {
			await votingInstance.addVoter(voterAuthorized, { from: owner })
            const voter = await votingInstance.getVoter(voterAuthorized, { from: voterAuthorized })
            expect(voter.isRegistered).to.equal(true)
		})

		// On vérifie si le votant est déjà dans la liste blanche
		it('...should not already exist the voter', async function() {
			await votingInstance.addVoter(voterAuthorized, { from: owner })
			await expectRevert(votingInstance.addVoter(voterAuthorized, { from: owner }), 'Already registered')
		})
		
		// On vérifie si le statut de vote est bien sur "RegisteringVoters"
		it('...should status is "RegisteringVoters"', async function() {
			await votingInstance.startProposalsRegistering({ from: owner })
			await expectRevert(votingInstance.addVoter(voterAuthorized, { from: owner }), 'Voters registration is not open yet')
		})
	})

	// Ensemble de tests pour l'ajout de propositions
	describe('Voters proposals', () => {
		beforeEach(async function () {
            votingInstance = await Voting.new({ from: owner })
			await votingInstance.addVoter(voterAuthorized, { from: owner })
        })

		// On vérifie que la fonction "addProposal" est bien présente dans le contrat
		it('...should exist the function addProposal()', async () => {
			expect(votingInstance.addProposal).to.be.a('function')
		})

		// On vérifie que la fonction "getOneProposal" est bien présente dans le contrat
		it('...should exist the function getOneProposal()', async () => {
			expect(votingInstance.getOneProposal).to.be.a('function')
		})
		
		// On verifie si le votant est dans la whitelist
		it('...should not add proposal if the voter is not in whitelist', async () => {
			await expectRevert(votingInstance.addProposal(proposal1, { from: voterNotAuthorized }), 'You\'re not a voter')
		})

		// On vérifie que l'on peut ajouter des propositions uniquement si le statut de vote est bien sur "ProposalsRegistrationStarted"
		it('...should status is ProposalsRegistrationStarted', async function() {
			await expectRevert(votingInstance.addProposal(proposal1, { from: voterAuthorized }), 'Proposals are not allowed yet')			
		})

		// On vérifie que la proposition n'est pas vide
		it('...should proposal is not empty', async function() {
			await votingInstance.startProposalsRegistering()
			await expectRevert(votingInstance.addProposal('', { from: voterAuthorized }), 'Vous ne pouvez pas ne rien proposer')			
		})

		// On vérifie après l'ajout d'une proposition l'événement "ProposalRegistered"
		it('...should send event "ProposalRegistered" after a proposal is added', async function() {
			await votingInstance.startProposalsRegistering()
			const result = await votingInstance.addProposal(proposal1, { from: voterAuthorized })
			expectEvent(result, 'ProposalRegistered', { proposalId: new BN(0) })			
		})

		// On vérifie si "getOneProposal" renvoie un tableau
		it('...should getOneProposal return an array', async () => {
			await votingInstance.startProposalsRegistering()
			await votingInstance.addProposal(proposal1, { from: voterAuthorized })
			const result = await votingInstance.getOneProposal(0, { from: voterAuthorized })
			expect(result).to.be.a('array')
		})

		// On vérifie si la proposition a bien été ajoutée au tableau "proposalsArray" sans être modifiée
		it('...should proposal inner "proposalsArray"', async () => {
			await votingInstance.startProposalsRegistering()
			await votingInstance.addProposal(proposal1, { from: voterAuthorized })
			const result = await votingInstance.getOneProposal(0, { from: voterAuthorized })
			expect(result.description).to.equal(proposal1, 'Proposals are equal')
		})
	})

	describe('Voting', () => {
        beforeEach(async function () {
            votingInstance = await Voting.new({ from: owner })
			await votingInstance.addVoter(voterAuthorized, { from: owner })
			await votingInstance.startProposalsRegistering()
			await votingInstance.addProposal(proposal1, { from: voterAuthorized })
			await votingInstance.endProposalsRegistering()
        })

		// On vérifie que la fonction "setVote" est bien présente dans le contrat
		it('...should exist the function setVote()', async () => {
			expect(votingInstance.setVote).to.be.a('function')
		})
		
		// On verifie si le votant est dans la whitelist
		it('...should voter is in whitelist', async () => {
			await expectRevert(votingInstance.setVote(0, { from: voterNotAuthorized }), 'You\'re not a voter')
		})

		// On vérifie que l'on peut ajouter des propositions uniquement si le statut de vote est bien sur "VotingSessionStarted"
		it('...should status is VotingSessionStarted', async function() {
			await expectRevert(votingInstance.setVote(0, { from: voterAuthorized }), 'Voting session havent started yet')			
		})

		// On verifie si le votant ne vote pas pour une proposition inexistante
		it('...should proposal exist', async () => {
			await votingInstance.startVotingSession()
			await expectRevert(votingInstance.setVote(new BN(20), { from: voterAuthorized }), 'Proposal not found')
		})

		// On verifie si le "hasVoted" à changer pour le votant
		it('...should hasVoted equal true after voting', async () => {
			await votingInstance.startVotingSession()
			await votingInstance.setVote(new BN(0), { from: voterAuthorized })
			const getVoter = await votingInstance.getVoter(voterAuthorized, { from: voterAuthorized })
			expect(getVoter.hasVoted).to.be.equal(true)
		})

		// On verifie si le votant n'a pas déjà voté
		it('...should not be a voter who has already voted', async () => {
			await votingInstance.startVotingSession()
			votingInstance.setVote(new BN(0), { from: voterAuthorized })
			await expectRevert(votingInstance.setVote(new BN(0), { from: voterAuthorized }), 'You have already voted')
		})

		// On vérifie l'événement "Voted" après avoir voté
		it('...should send event "Voted" after voting', async function() {
			await votingInstance.startVotingSession()
			const result = await votingInstance.setVote(new BN(0), { from: voterAuthorized })
			expectEvent(result, 'Voted', { voter: voterAuthorized, proposalId: new BN(0) })
		})
	})

	describe('Tally votes', () => {
        beforeEach(async function () {
            votingInstance = await Voting.new({ from: owner })
			await votingInstance.addVoter(voterAuthorized, { from: owner })
			await votingInstance.addVoter(owner, { from: owner })
			await votingInstance.startProposalsRegistering()
			await votingInstance.addProposal(proposal1, { from: voterAuthorized })
			await votingInstance.addProposal(proposal2, { from: voterAuthorized })
			await votingInstance.endProposalsRegistering()
			await votingInstance.startVotingSession()
            await votingInstance.setVote(1, { from: owner })
            await votingInstance.setVote(1, { from: voterAuthorized })
        })

		// On vérifie que la fonction "tallyVotes" est bien présente dans le contrat
		it('...should exist the function tallyVotes()', async () => {
			expect(votingInstance.tallyVotes).to.be.a('function')
		})

		// On vérifie que l'on peut voir les résultats uniquement si le statut de vote est bien sur "endVotingSession"
		it('...should status is endVotingSession', async function() {
			await expectRevert(votingInstance.tallyVotes(), 'Current status is not voting session ended')			
		})

		// On vérifie que l'admin est le seul à pouvoir voir les résultats
		it('...should not see results if the caller is not an admin', async () => {
			await expectRevert(votingInstance.tallyVotes({ from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// On vérifie que l'on peut voir les résultats uniquement si le statut de vote est bien sur "endVotingSession"
		it('...should status is endVotingSession', async function() {
			await expectRevert(votingInstance.tallyVotes(), 'Current status is not voting session ended')			
		})

		// On vérifie l'événement "WorkflowStatusChange"
		it('...should send event "WorkflowStatusChange" after voting', async function() {
			await votingInstance.endVotingSession()
			const result = await votingInstance.tallyVotes()
			expectEvent(result, 'WorkflowStatusChange', { previousStatus: new BN(4), newStatus: new BN(5) })
		})

		// On vérifie que le bon résultat des votes est envoyé
		it('...should return the winner', async function() {
			await votingInstance.endVotingSession()
			await votingInstance.tallyVotes()
			const winner = await votingInstance.winningProposalID()
			expect(new BN(winner)).to.be.bignumber.equal(new BN (1))
		})
	})

	describe('Change status workflow', () => {
        beforeEach(async function () {
            votingInstance = await Voting.new({ from: owner })
        })

		// On vérifie que la fonction "startProposalsRegistering" est bien présente dans le contrat
		it('...should exist the function startProposalsRegistering()', async () => {
			expect(votingInstance.startProposalsRegistering).to.be.a('function')
		})

		// On vérifie que la fonction "endProposalsRegistering" est bien présente dans le contrat
		it('...should exist the function endProposalsRegistering()', async () => {
			expect(votingInstance.endProposalsRegistering).to.be.a('function')
		})

		// On vérifie que la fonction "startVotingSession" est bien présente dans le contrat
		it('...should exist the function startVotingSession()', async () => {
			expect(votingInstance.startVotingSession).to.be.a('function')
		})

		// On vérifie que la fonction "endVotingSession" est bien présente dans le contrat
		it('...should exist the function endVotingSession()', async () => {
			expect(votingInstance.endVotingSession).to.be.a('function')
		})

		// On vérifie que l'admin est le seul à pouvoir changer le statut "startProposalsRegistering"
		it('...should not change status to "startProposalsRegistering" if the caller is not an admin', async () => {
			await expectRevert(votingInstance.startProposalsRegistering({ from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// Vérifier le passage de workflow de RegisteringVoters à ProposalsRegistrationStarted
        it('...should change workflow 0 to 1', async () => {
            await votingInstance.startProposalsRegistering()
            const status = new BN(await votingInstance.workflowStatus())
            const statusProposalsRegistrationStarted = new BN(Voting.WorkflowStatus.ProposalsRegistrationStarted)
            expect(status).to.be.bignumber.equal(statusProposalsRegistrationStarted)
        })

		// On vérifie l'événement "WorkflowStatusChange" au changement de workflow de RegisteringVoters à ProposalsRegistrationStarted
		it('...should send event "WorkflowStatusChange" after changing workflow 0 to 1', async function() {
			const status = await votingInstance.startProposalsRegistering()
			expectEvent(status, 'WorkflowStatusChange', { previousStatus: new BN(0), newStatus: new BN(1) })
		})

		// On vérifie que l'admin est le seul à pouvoir changer le statut "endProposalsRegistering"
		it('...should not change status to "endProposalsRegistering" if the caller is not an admin', async () => {
			await expectRevert(votingInstance.endProposalsRegistering({ from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// Vérifier le passage de workflow de ProposalsRegistrationStarted à ProposalsRegistrationEnded
		it('...should change workflow 1 to 2', async () => {
			await votingInstance.startProposalsRegistering()
            await votingInstance.endProposalsRegistering()
            const status = new BN(await votingInstance.workflowStatus())
            const statusProposalsRegistrationEnded = new BN(Voting.WorkflowStatus.ProposalsRegistrationEnded)
            expect(status).to.be.bignumber.equal(statusProposalsRegistrationEnded)
        })

		// On vérifie l'événement "WorkflowStatusChange" au changement de workflow de ProposalsRegistrationStarted à ProposalsRegistrationEnded
		it('...should send event "WorkflowStatusChange" after changing workflow 1 to 2', async function() {
			await votingInstance.startProposalsRegistering()
			const status = await votingInstance.endProposalsRegistering()
			expectEvent(status, 'WorkflowStatusChange', { previousStatus: new BN(1), newStatus: new BN(2) })
		})

		// On vérifie que l'admin est le seul à pouvoir changer le statut "startVotingSession"
		it('...should not change status to "startVotingSession" if the caller is not an admin', async () => {
			await expectRevert(votingInstance.startVotingSession({ from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// Vérifier le passage de workflow de ProposalsRegistrationEnded à VotingSessionStarted
		it('...should change workflow 2 to 3', async () => {
			await votingInstance.startProposalsRegistering()
            await votingInstance.endProposalsRegistering()
            await votingInstance.startVotingSession()
            const status = new BN(await votingInstance.workflowStatus())
            const statusVotingSessionStarted = new BN(Voting.WorkflowStatus.VotingSessionStarted)
            expect(status).to.be.bignumber.equal(statusVotingSessionStarted)
        })

		// On vérifie l'événement "WorkflowStatusChange" au changement de workflow de ProposalsRegistrationEnded à VotingSessionStarted
		it('...should send event "WorkflowStatusChange" after changing workflow 2 to 3', async function() {
			await votingInstance.startProposalsRegistering()
            await votingInstance.endProposalsRegistering()
			const status = await votingInstance.startVotingSession()
			expectEvent(status, 'WorkflowStatusChange', { previousStatus: new BN(2), newStatus: new BN(3) })
		})

		// On vérifie que l'admin est le seul à pouvoir changer le statut "endVotingSession"
		it('...should not change status to "endVotingSession" if the caller is not an admin', async () => {
			await expectRevert(votingInstance.endVotingSession({ from: voterAuthorized }), 'Ownable: caller is not the owner')
		})

		// Vérifier le passage de workflow de VotingSessionStarted à VotingSessionEnded
		it('...should change workflow 3 to 4', async () => {
			await votingInstance.startProposalsRegistering()
            await votingInstance.endProposalsRegistering()
            await votingInstance.startVotingSession()
            await votingInstance.endVotingSession()
            const status = new BN(await votingInstance.workflowStatus())
            const statusVotingSessionEnded = new BN(Voting.WorkflowStatus.VotingSessionEnded)
            expect(status).to.be.bignumber.equal(statusVotingSessionEnded)
        })

		// On vérifie l'événement "WorkflowStatusChange" au changement de workflow de VotingSessionStarted à VotingSessionEnded
		it('...should send event "WorkflowStatusChange" after changing workflow 3 to 4', async function() {
			await votingInstance.startProposalsRegistering()
            await votingInstance.endProposalsRegistering()
            await votingInstance.startVotingSession()
			const status = await votingInstance.endVotingSession()
			expectEvent(status, 'WorkflowStatusChange', { previousStatus: new BN(3), newStatus: new BN(4) })
		})
    })
})
