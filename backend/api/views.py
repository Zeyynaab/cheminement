from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Etudiant
from .serializers import EtudiantSerializer
from .models import Cours
from .serializers import CoursSerializer
from .models import Programme
from .serializers import ProgrammeSerializer
from .models import Prerequis
from .serializers import PrerequisSerializer
from .models import Session
from .serializers import SessionSerializer
from .models import Cheminement
from .models import CoursParSession
from .serializers import CoursParSessionSerializer
from collections import defaultdict

#vue pour les programmes 
@api_view(['GET'])
def list_programmes(request):
    programmes = Programme.objects.all()
    serializer = ProgrammeSerializer(programmes, many=True)
    return Response(serializer.data)

#vue pour la liste des etudiants
@api_view(['GET'])
def list_etudiants(request):
    etudiants = Etudiant.objects.all()
    serializer = EtudiantSerializer(etudiants, many=True)
    return Response(serializer.data)

#vue pour voir la liste des cours 
@api_view(['GET'])
def list_cours(request):
    cours = Cours.objects.all()
    serializer = CoursSerializer(cours, many=True)
    return JsonResponse(serializer.data, safe=False)

#vue pour ajouter un cours 
@api_view(['POST'])
def ajouter_cours(request):
    serializer = CoursSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

#vue pour modifier un cours 
@api_view(['PUT'])
def modifier_cours(request, id):
    try:
        cours = Cours.objects.get(id=id)
    except Cours.DoesNotExist:
        return Response({"error": "Cours non trouvé"}, status=404)

    serializer = CoursSerializer(cours, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

#vue pour supprimer un cours 
@api_view(['DELETE'])
def supprimer_cours(request, id):
    try:
        cours = Cours.objects.get(id=id)
        cours.delete()
        return Response({"message": "Cours supprimé avec succès"}, status=204)
    except Cours.DoesNotExist:
        return Response({"error": "Cours non trouvé"}, status=404)

#vue pour la liste des prerequis
@api_view(['GET'])
def list_prerequis(request):
    prerequis = Prerequis.objects.all()
    serializer = PrerequisSerializer(prerequis, many=True)
    return Response(serializer.data)

# vue pour ajouter un prérequis
@api_view(['POST'])
def ajouter_prerequis(request):
    serializer = PrerequisSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

#vue pour afficher la liste des sessions
@api_view(['GET'])
def list_sessions(request):
    sessions = Session.objects.all()
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)

#vue pour associer un cours a une session
@api_view(['POST'])
def associer_cours_session(request):
    print("✅ La vue a bien été appelée !")
    id_cours = request.data.get('id_cours')
    id_session = request.data.get('id_session')

    try:
        cours = Cours.objects.get(id=id_cours)
        session = Session.objects.get(id=id_session)
        session.cours.add(cours)
        return Response({'message': 'Cours associé à la session avec succès.'})
    except Cours.DoesNotExist:
        return Response({'error': 'Cours non trouvé'}, status=404)
    except Session.DoesNotExist:
        return Response({'error': 'Session non trouvée'}, status=404)
    
     

# vue pour la génération du cheminement
@api_view(['POST'])
def generer_cheminement(request):
    SESSIONS_COMPLETES = [
        "Automne 1", "Hiver 1",
        "Automne 2", "Hiver 2",
        "Automne 3", "Hiver 3"
    ]

    etudiant_id = request.data.get("id_etudiant")
    try:
        etudiant = Etudiant.objects.get(id=etudiant_id)
    except Etudiant.DoesNotExist:
        return JsonResponse({"error": "Étudiant non trouvé"}, status=404)

    programme = etudiant.programme
    cours_programme = list(Cours.objects.filter(programme=programme))
    prerequis_dict = defaultdict(list)
    for p in Prerequis.objects.all():
        prerequis_dict[p.cours_id].append(p.prerequis_id)

    cheminement, _ = Cheminement.objects.get_or_create(etudiant=etudiant)
    CoursParSession.objects.filter(cheminement=cheminement).delete()

    # Créer ou récupérer les sessions prévues
    sessions = {}
    for label in SESSIONS_COMPLETES:
        nom, num = label.split()
        num = int(num)
        session, _ = Session.objects.get_or_create(
            nom_session=nom,
            numero_session=num,
            cheminement=cheminement
        )
        sessions[label] = session

    session_labels = list(sessions.keys())
    session_index = 0
    cours_faits = set()
    cours_restants = set(c.id for c in cours_programme)

    while cours_restants:
        cours_ajoutes = []
        for cid in cours_restants:
            if all(pr in cours_faits for pr in prerequis_dict[cid]):
                cours = Cours.objects.get(id=cid)
                label = session_labels[session_index % len(session_labels)]
                CoursParSession.objects.create(
                    cheminement=cheminement,
                    cours=cours,
                    session=sessions[label]
                )
                cours_ajoutes.append(cid)

        if not cours_ajoutes:
            break

        for cid in cours_ajoutes:
            cours_faits.add(cid)
            cours_restants.remove(cid)

        session_index += 1

    #  Organiser les cours par session
    cours_par_session = {label: [] for label in SESSIONS_COMPLETES}
    cours_par_sessions = CoursParSession.objects.filter(cheminement=cheminement)

    for cps in cours_par_sessions:
        label = f"{cps.session.nom_session} {cps.session.numero_session}"
        cours_par_session[label].append({
            "code_cours": cps.cours.code_cours,
            "nom_cours": cps.cours.nom_cours,
            "prerequis": list(
                Prerequis.objects.filter(cours=cps.cours)
                .values_list("prerequis__code_cours", flat=True)
            )
        })

    # Retourner toutes les sessions, même vides
    resultat_sessions = []
    for label in SESSIONS_COMPLETES:
        nom, num = label.split()
        cours_list = cours_par_session.get(label, [])
        resultat_sessions.append({
            "session": label,
            "nom_session": nom,
            "numero_session": int(num),
            "cours": cours_list
        })

    cours_optionnels = Cours.objects.filter(programme=programme, est_optionnel=True)
    optionnels_data = [{"code_cours": c.code_cours, "nom_cours": c.nom_cours} for c in cours_optionnels]

    return JsonResponse({
        "cours_par_session": resultat_sessions,
        "cours_optionnels": optionnels_data
    }, safe=False)


#Vue pour generer le graphe

@api_view(['GET'])
def generer_graphe(request):
    programme_id = request.GET.get("programme_id")
    etudiant_id = request.GET.get("etudiant_id")

    if not programme_id:
        return JsonResponse({"error": "Programme requis"}, status=400)

    cours_programme = Cours.objects.filter(programme_id=programme_id)
    #cours_list = list(cours_programme.values("id", "code_cours", "nom_cours"))
   #nouvelle modif
    cours_list = list(
    CoursParSession.objects.filter(cours__programme_id=programme_id)
    .select_related("cours", "session", "cheminement")
    .values(
        "cours__id",
        "cours__code_cours",
        "cours__nom_cours",
        "session__numero_session"
    )
)

    # Liste des cours faits par l'étudiant
    cours_faits_ids = set()
    if etudiant_id:
        try:
            etudiant = Etudiant.objects.get(id=etudiant_id)
            cheminement = Cheminement.objects.get(etudiant=etudiant)
            cours_faits_ids = set(
                CoursParSession.objects.filter(cheminement=cheminement)
                .values_list("cours_id", flat=True)
            )
        except (Etudiant.DoesNotExist, Cheminement.DoesNotExist):
            pass  # Aucun cours fait

    # On structure le graphe
    nodes = []
    edges = []
    
    # Récupérer la session de chaque cours pour ce cheminement
    cours_sessions_map = {}
    if etudiant_id:
      try:
            etudiant = Etudiant.objects.get(id=etudiant_id)
            cheminement = Cheminement.objects.get(etudiant=etudiant)
            cours_sessions = CoursParSession.objects.filter(cheminement=cheminement)
            for cs in cours_sessions:
             cours_sessions_map[cs.cours.id] = cs.session.numero_session
      except:
        pass
    #nouvelle modif cours_sessions_map
    for c in cours_list:
        # Node
        cours_id = c["cours__id"]
        nodes.append({
            "id": cours_id,
            "label": c["cours__code_cours"],
            "nom": c["cours__nom_cours"],
            "session": c["session__numero_session"],

            "fait": cours_id in cours_faits_ids
        })
        # Arcs depuis ses préalables
        prereqs = Prerequis.objects.filter(cours_id=cours_id)
        for p in prereqs:
            edges.append({
                "from": p.prerequis_id,
                "to": cours_id
            })

    return JsonResponse({
        "nodes": nodes,
        "edges": edges
    }, safe=False)
